import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { StorageModule } from "@storage/storage.module";

import { AttachmentService } from "@attachment/attachment.service";
import { AttachmentController } from "@attachment/attachment.controller";
import { Attachment } from "@attachment/models/attachment.model";

@Module({
    imports: [TypeOrmModule.forFeature([Attachment]), forwardRef(() => StorageModule)],
    providers: [AttachmentService],
    exports: [AttachmentService],
    controllers: [AttachmentController],
})
export class AttachmentModule {}
