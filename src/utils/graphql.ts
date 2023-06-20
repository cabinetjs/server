import DataLoader from "dataloader";

import { PostService } from "@post/post.service";
import { Post } from "@post/models/post.model";

import { AttachmentService } from "@attachment/attachment.service";
import { Attachment } from "@attachment/models/attachment.model";
import _ from "lodash";

export interface GraphQLContext {
    loaders: {
        post: DataLoader<Post["uri"], Post>;
        openingPost: DataLoader<Post["uri"], Post | null>;
        attachment: DataLoader<Attachment["uri"], Attachment>;
        attachmentOfPost: DataLoader<Post["uri"], Attachment[]>;
    };
}

export function createGraphQLContext(postService: PostService, attachmentService: AttachmentService): GraphQLContext {
    return {
        loaders: {
            post: new DataLoader(async (ids: readonly Post["uri"][]) => postService.findByIds(ids)),
            openingPost: new DataLoader(async (ids: readonly Post["uri"][]) => postService.findOpeningByIds(ids)),
            attachment: new DataLoader(async (ids: readonly Attachment["uri"][]) => attachmentService.findByIds(ids)),
            attachmentOfPost: new DataLoader(async (ids: readonly Post["uri"][]) => {
                const attachmentIdsMap = await attachmentService.getBulkIdsOf(ids);
                const allIds = _.chain(attachmentIdsMap).values().flatten().value();
                const attachments = await attachmentService.findByIds(allIds);

                return ids.map(id => {
                    const attachmentIds = attachmentIdsMap[id];
                    if (!attachmentIds) {
                        return [];
                    }

                    return attachments.filter(attachment => attachmentIds.includes(attachment.uri));
                });
            }),
        },
    };
}
