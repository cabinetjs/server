import { Module } from "@nestjs/common";

import { DataSourceModule } from "@data-source/data-source.module";
import { DatabaseModule } from "@database/database.module";
import { AttachmentModule } from "@attachment/attachment.module";

import { CrawlerService } from "@crawler/crawler.service";

@Module({
    imports: [DataSourceModule, DatabaseModule, AttachmentModule],
    providers: [CrawlerService],
})
export class CrawlerModule {}
