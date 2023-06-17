import { Repository } from "typeorm";

import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OnEvent } from "@nestjs/event-emitter";

import { Attachment, RawAttachment } from "@attachment/models/attachment.model";
import { AttachmentCreatedEvent } from "@attachment/events/attachment-created.event";

import { Post } from "@post/models/post.model";

import { StorageService } from "@storage/storage.service";
import { BaseService } from "@common/base.service";

@Injectable()
export class AttachmentService extends BaseService<Attachment, RawAttachment> {
    public constructor(
        @InjectRepository(Attachment) attachmentRepository: Repository<Attachment>,
        @Inject(forwardRef(() => StorageService)) private readonly storageService: StorageService,
    ) {
        super(Attachment, attachmentRepository);
    }

    public async getBulkIdsOf(postIds: ReadonlyArray<Post["id"]>): Promise<Record<Post["id"], Attachment["id"][]>> {
        const idMap: Record<Post["id"], Attachment["id"][]> = {};
        const result = await this.repository
            .createQueryBuilder("a")
            .select("`a`.`id`", "id")
            .addSelect("`a`.`postId`", "postId")
            .where("`a`.`postId` IN (:...ids)", { ids: postIds })
            .getRawMany<{ id: Attachment["id"]; postId: Post["id"] }>();

        for (const { id, postId } of result) {
            if (!idMap[postId]) {
                idMap[postId] = [];
            }

            idMap[postId].push(id);
        }

        return idMap;
    }

    @OnEvent("attachment.created")
    public async handleAttachmentCreatedEvent({ attachments }: AttachmentCreatedEvent) {
        await this.storageService.store(attachments);
    }
}
