import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { StorageModule } from "@storage/storage.module";

import { AttachmentService } from "@attachment/attachment.service";
import { Attachment } from "@attachment/models/attachment.model";

@Module({
    imports: [TypeOrmModule.forFeature([Attachment]), forwardRef(() => StorageModule)],
    providers: [AttachmentService],
    exports: [AttachmentService],
})
export class AttachmentModule {}
