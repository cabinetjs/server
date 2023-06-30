import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DataSourceModule } from "@data-source/data-source.module";
import { DatabaseModule } from "@database/database.module";
import { AttachmentModule } from "@attachment/attachment.module";

import { CrawlerService } from "@crawler/crawler.service";
import { CrawlerLog } from "@crawler/models/crawler-log.model";

@Module({
    imports: [TypeOrmModule.forFeature([CrawlerLog]), DataSourceModule, DatabaseModule, AttachmentModule],
    providers: [CrawlerService],
    exports: [CrawlerService],
})
export class CrawlerModule {}
