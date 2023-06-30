import { Module } from "@nestjs/common";

import { DataSourceModule } from "@data-source/data-source.module";
import { BoardModule } from "@board/board.module";
import { PostModule } from "@post/post.module";
import { AttachmentModule } from "@attachment/attachment.module";
import { CrawlerModule } from "@crawler/crawler.module";

import { StatisticService } from "@statistic/statistic.service";
import { StatisticResolver } from "@statistic/statistic.resolver";

@Module({
    imports: [DataSourceModule, BoardModule, PostModule, AttachmentModule, CrawlerModule],
    providers: [StatisticService, StatisticResolver],
})
export class StatisticModule {}
