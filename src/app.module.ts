import { DynamicModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventEmitterModule } from "@nestjs/event-emitter";

import { ConfigModule } from "@config/config.module";
import { DataSourceModule } from "@data-source/data-source.module";
import { CrawlerModule } from "@crawler/crawler.module";
import { PostModule } from "@post/post.module";
import { BoardModule } from "@board/board.module";
import { ThreadModule } from "@thread/thread.module";
import { AttachmentModule } from "@attachment/attachment.module";
import { DatabaseModule } from "@database/database.module";
import { StorageModule } from "@storage/storage.module";

@Module({})
export class AppModule {
    public static forRoot(configFilePath: string): DynamicModule {
        return {
            module: AppModule,
            imports: [
                ConfigModule.forRoot(configFilePath),
                TypeOrmModule.forRoot({
                    type: "sqlite",
                    database: "database.sqlite",
                    entities: [__dirname + "/**/*.model{.ts,.js}"],
                    synchronize: true,
                    dropSchema: true,
                }),
                EventEmitterModule.forRoot({
                    wildcard: false,
                    delimiter: ".",
                    newListener: false,
                    removeListener: false,
                    maxListeners: 10,
                    verboseMemoryLeak: false,
                    ignoreErrors: false,
                }),
                DataSourceModule,
                PostModule,
                BoardModule,
                ThreadModule,
                AttachmentModule,
                DatabaseModule,
                StorageModule,
                CrawlerModule,
            ],
        };
    }
}
