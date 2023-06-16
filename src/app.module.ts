import { DynamicModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventEmitterModule } from "@nestjs/event-emitter";

import { Config, ConfigModule } from "@config/config.module";
import { DataSourceModule } from "@data-source/data-source.module";
import { CrawlerModule } from "@crawler/crawler.module";
import { PostModule } from "@post/post.module";
import { BoardModule } from "@board/board.module";
import { AttachmentModule } from "@attachment/attachment.module";
import { DatabaseModule } from "@database/database.module";
import { StorageModule } from "@storage/storage.module";

@Module({})
export class AppModule {
    public static forRoot(config: Config, dropDatabase: boolean): DynamicModule {
        return {
            module: AppModule,
            imports: [
                ConfigModule.forRoot(config),
                TypeOrmModule.forRoot({
                    type: "sqlite",
                    database: "database.sqlite",
                    entities: [`${__dirname}/**/*.model{.ts,.js}`],
                    migrations: [`${__dirname}/migrations/**/*{.ts,.js}`],
                    dropSchema: dropDatabase,
                    autoLoadEntities: true,
                    migrationsRun: true,
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
                AttachmentModule,
                DatabaseModule,
                StorageModule,
                CrawlerModule,
            ],
        };
    }
}
