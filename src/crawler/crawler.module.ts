import { Module } from "@nestjs/common";

import { DataSourceModule } from "@data-source/data-source.module";
import { BoardModule } from "@board/board.module";
import { ThreadModule } from "@thread/thread.module";
import { PostModule } from "@post/post.module";

import { CrawlerService } from "@crawler/crawler.service";

@Module({
    imports: [DataSourceModule, BoardModule, ThreadModule, PostModule],
    providers: [CrawlerService],
})
export class CrawlerModule {}
