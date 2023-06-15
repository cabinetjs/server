import { Module } from "@nestjs/common";

import { ConfigModule } from "@config/config.module";
import { DataSourceModule } from "@data-source/data-source.module";
import { CrawlerModule } from "@crawler/crawler.module";
import { PostModule } from "@post/post.module";
import { BoardModule } from "@board/board.module";
import { ThreadModule } from "@thread/thread.module";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: "sqlite",
            database: "database.sqlite",
            entities: [__dirname + "/**/*.model{.ts,.js}"],
            synchronize: true,
            dropSchema: true,
        }),
        DataSourceModule,
        CrawlerModule,
        PostModule,
        BoardModule,
        ThreadModule,
    ],
})
export class AppModule {}
