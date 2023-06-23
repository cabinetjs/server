import { forwardRef, Module } from "@nestjs/common";

import { StorageService } from "@storage/storage.service";

import { AttachmentModule } from "@attachment/attachment.module";
import { ThumbnailModule } from "@thumbnail/thumbnail.module";

@Module({
    imports: [forwardRef(() => AttachmentModule), forwardRef(() => ThumbnailModule)],
    providers: [StorageService],
    exports: [StorageService],
})
export class StorageModule {}
