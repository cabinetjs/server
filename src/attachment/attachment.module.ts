import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AttachmentService } from "@attachment/attachment.service";

import { Attachment } from "@attachment/models/attachment.model";

@Module({
    imports: [TypeOrmModule.forFeature([Attachment])],
    providers: [AttachmentService],
    exports: [AttachmentService],
})
export class AttachmentModule {}
