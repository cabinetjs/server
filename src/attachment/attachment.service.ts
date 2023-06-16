import { Repository } from "typeorm";

import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OnEvent } from "@nestjs/event-emitter";

import { Attachment, RawAttachment } from "@attachment/models/attachment.model";
import { AttachmentCreatedEvent } from "@attachment/events/attachment-created.event";

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

    @OnEvent("attachment.created")
    public async handleAttachmentCreatedEvent({ attachments }: AttachmentCreatedEvent) {
        await this.storageService.store(attachments);
    }
}
