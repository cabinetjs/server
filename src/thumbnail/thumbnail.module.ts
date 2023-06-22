import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Thumbnail } from "@thumbnail/models/thumbnail.model";

import { StorageModule } from "@storage/storage.module";
import { AttachmentModule } from "@attachment/attachment.module";

import { ThumbnailService } from "@thumbnail/thumbnail.service";
import { ThumbnailController } from "@thumbnail/thumbnail.controller";
import { ThumbnailResolver } from "@thumbnail/thumbnail.resolver";

@Module({
    imports: [TypeOrmModule.forFeature([Thumbnail]), StorageModule, forwardRef(() => AttachmentModule)],
    providers: [ThumbnailService, ThumbnailResolver],
    controllers: [ThumbnailController],
    exports: [ThumbnailService],
})
export class ThumbnailModule {}
