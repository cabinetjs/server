import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Thumbnail } from "@thumbnail/models/thumbnail.model";

import { StorageModule } from "@storage/storage.module";
import { AttachmentModule } from "@attachment/attachment.module";

import { ThumbnailService } from "@thumbnail/thumbnail.service";
import { ThumbnailController } from "@thumbnail/thumbnail.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Thumbnail]), StorageModule, AttachmentModule],
    providers: [ThumbnailService],
    controllers: [ThumbnailController],
})
export class ThumbnailModule {}
