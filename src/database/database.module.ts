import { Module } from "@nestjs/common";

import { BoardModule } from "@board/board.module";
import { ThreadModule } from "@thread/thread.module";
import { PostModule } from "@post/post.module";
import { AttachmentModule } from "@attachment/attachment.module";

import { DatabaseService } from "@database/database.service";

@Module({
    imports: [BoardModule, ThreadModule, PostModule, AttachmentModule],
    providers: [DatabaseService],
    exports: [DatabaseService],
})
export class DatabaseModule {}
