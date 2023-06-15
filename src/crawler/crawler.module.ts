import { Module } from "@nestjs/common";

import { DataSourceModule } from "@data-source/data-source.module";
import { DatabaseModule } from "@database/database.module";

import { CrawlerService } from "@crawler/crawler.service";

@Module({
    imports: [DataSourceModule, DatabaseModule],
    providers: [CrawlerService],
})
export class CrawlerModule {}
