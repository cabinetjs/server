import DataLoader from "dataloader";

import { PostService } from "@post/post.service";
import { Post } from "@post/models/post.model";

import { AttachmentService } from "@attachment/attachment.service";
import { Attachment } from "@attachment/models/attachment.model";
import _ from "lodash";

export interface GraphQLContext {
    loaders: {
        post: DataLoader<Post["id"], Post>;
        openingPost: DataLoader<Post["id"], Post | null>;
        attachment: DataLoader<Attachment["id"], Attachment>;
        attachmentOfPost: DataLoader<Post["id"], Attachment[]>;
        postReplyCount: DataLoader<Post["id"], number>;
        postAttachmentCount: DataLoader<Post["id"], number>;
    };
}

export function createGraphQLContext(postService: PostService, attachmentService: AttachmentService): GraphQLContext {
    return {
        loaders: {
            post: new DataLoader(async (ids: readonly Post["id"][]) => postService.findByIds(ids)),
            openingPost: new DataLoader(async (ids: readonly Post["id"][]) => postService.findOpeningByIds(ids)),
            attachment: new DataLoader(async (ids: readonly Attachment["id"][]) => attachmentService.findByIds(ids)),
            attachmentOfPost: new DataLoader(async (ids: readonly Post["id"][]) => {
                const attachmentIdsMap = await attachmentService.getBulkIdsOf(ids);
                const allIds = _.chain(attachmentIdsMap).values().flatten().value();
                const attachments = await attachmentService.findByIds(allIds);

                return ids.map(id => {
                    const attachmentIds = attachmentIdsMap[id];
                    if (!attachmentIds) {
                        return [];
                    }

                    return attachments.filter(attachment => attachmentIds.includes(attachment.id));
                });
            }),
            postReplyCount: new DataLoader(async (ids: readonly Post["id"][]) => postService.getReplyCounts(ids)),
            postAttachmentCount: new DataLoader(async (ids: readonly Post["id"][]) => {
                return postService.getAttachmentCounts(ids);
            }),
        },
    };
}
