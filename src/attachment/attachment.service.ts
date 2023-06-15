import { Repository } from "typeorm";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Attachment, RawAttachment } from "@attachment/models/attachment.model";

import { BaseService } from "@common/base.service";

@Injectable()
export class AttachmentService extends BaseService<Attachment, RawAttachment> {
    public constructor(@InjectRepository(Attachment) attachmentRepository: Repository<Attachment>) {
        super(Attachment, attachmentRepository);
    }
}
