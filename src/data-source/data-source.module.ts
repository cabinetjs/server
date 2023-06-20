import { Module } from "@nestjs/common";

import { PostModule } from "@post/post.module";
import { AttachmentModule } from "@attachment/attachment.module";
import { BoardModule } from "@board/board.module";

import { DataSourceService } from "@data-source/data-source.service";
import { DataSourceResolver } from "@data-source/data-source.resolver";

@Module({
    imports: [PostModule, AttachmentModule, BoardModule],
    providers: [DataSourceService, DataSourceResolver],
    exports: [DataSourceService],
})
export class DataSourceModule {}
