import { forwardRef, Module } from "@nestjs/common";

import { StorageService } from "@storage/storage.service";

import { AttachmentModule } from "@attachment/attachment.module";

@Module({
    imports: [forwardRef(() => AttachmentModule)],
    providers: [StorageService],
    exports: [StorageService],
})
export class StorageModule {}
