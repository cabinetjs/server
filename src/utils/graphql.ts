import _ from "lodash";
import DataLoader from "dataloader";

import { PostService } from "@post/post.service";
import { Post } from "@post/models/post.model";

import { AttachmentService } from "@attachment/attachment.service";
import { Attachment } from "@attachment/models/attachment.model";

import { ThumbnailService, ThumbnailSize } from "@thumbnail/thumbnail.service";
import { Thumbnail } from "@thumbnail/models/thumbnail.model";

export interface GraphQLContext {
    loaders: {
        post: DataLoader<Post["id"], Post>;
        openingPost: DataLoader<Post["id"], Post | null>;
        attachment: DataLoader<Attachment["id"], Attachment>;
        attachmentOfPost: DataLoader<Post["id"], Attachment[]>;
        postReplyCount: DataLoader<Post["id"], number>;
        postAttachmentCount: DataLoader<Post["id"], number>;
        thumbnail: DataLoader<[Attachment["id"], ThumbnailSize], Thumbnail, string>;
    };
}

export function createGraphQLContext(
    postService: PostService,
    attachmentService: AttachmentService,
    thumbnailService: ThumbnailService,
): GraphQLContext {
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
            thumbnail: new DataLoader(
                async (keys: readonly [Attachment["id"], ThumbnailSize][]) => {
                    const allIds = keys.map(([attachmentId]) => attachmentId);
                    const attachments = await attachmentService.findByIds(allIds);
                    const attachmentMap = _.keyBy(attachments, "id");
                    const pairs = keys.map<[Attachment, ThumbnailSize]>(([attachmentId, size]) => {
                        const attachment = attachmentMap[attachmentId];
                        if (!attachment) {
                            throw new Error(`Attachment ${attachmentId} not found`);
                        }

                        return [attachment, size];
                    });

                    return thumbnailService.bulkEnsure(pairs);
                },
                { cacheKeyFn: ([attachmentId, size]) => `${attachmentId}:${JSON.stringify(size)}` },
            ),
        },
    };
}
