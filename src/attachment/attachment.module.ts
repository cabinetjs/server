import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { StorageModule } from "@storage/storage.module";

import { AttachmentService } from "@attachment/attachment.service";
import { AttachmentController } from "@attachment/attachment.controller";
import { Attachment } from "@attachment/models/attachment.model";
import { AttachmentResolver } from "@attachment/attachment.resolver";
import { ThumbnailModule } from "@thumbnail/thumbnail.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Attachment]),
        forwardRef(() => StorageModule),
        forwardRef(() => ThumbnailModule),
    ],
    providers: [AttachmentService, AttachmentResolver],
    exports: [AttachmentService],
    controllers: [AttachmentController],
})
export class AttachmentModule {}
