import { Repository } from "typeorm";

import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OnEvent } from "@nestjs/event-emitter";

import { Attachment, RawAttachment } from "@attachment/models/attachment.model";
import { AttachmentCreatedEvent } from "@attachment/events/attachment-created.event";

import { Post } from "@post/models/post.model";

import { StorageService } from "@storage/storage.service";
import { BaseService } from "@common/base.service";
import { Nullable } from "@utils/types";

@Injectable()
export class AttachmentService extends BaseService<Attachment, RawAttachment> {
    public constructor(
        @InjectRepository(Attachment) attachmentRepository: Repository<Attachment>,
        @Inject(forwardRef(() => StorageService)) private readonly storageService: StorageService,
    ) {
        super(Attachment, attachmentRepository);
    }

    public async getBulkIdsOf(postIds: ReadonlyArray<Post["uri"]>): Promise<Record<Post["uri"], Attachment["uri"][]>> {
        const idMap: Record<Post["uri"], Attachment["uri"][]> = {};
        const result = await this.repository
            .createQueryBuilder("a")
            .select("`a`.`id`", "id")
            .addSelect("`a`.`postId`", "postId")
            .where("`a`.`postId` IN (:...ids)", { ids: postIds })
            .getRawMany<{ id: Attachment["uri"]; postId: Post["uri"] }>();

        for (const { id, postId } of result) {
            if (!idMap[postId]) {
                idMap[postId] = [];
            }

            idMap[postId].push(id);
        }

        return idMap;
    }

    public async getFileSize(startDate: Nullable<Date>, endDate: Nullable<Date>) {
        const result = await this.repository.createQueryBuilder("a").select("SUM(`a`.`size`)", "size");

        if (startDate && !endDate) {
            result.andWhere("`a`.`createdAt` >= :startDate", { startDate });
        } else if (!startDate && endDate) {
            result.andWhere("`a`.`createdAt` <= :endDate", { endDate });
        } else if (startDate && endDate) {
            result.andWhere("`a`.`createdAt` BETWEEN :startDate AND :endDate", { startDate, endDate });
        }

        const data = await result.getRawOne<{ size: string }>();
        if (!data) {
            throw new Error("Unexpected error occurred");
        }

        return parseInt(`${data.size}`, 10);
    }

    @OnEvent("attachment.created")
    public async handleAttachmentCreatedEvent({ attachments }: AttachmentCreatedEvent) {
        await this.storageService.store(attachments);
    }
}
