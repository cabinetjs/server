import path from "path";

import { DynamicModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver } from "@nestjs/apollo";

import { Config, ConfigModule } from "@config/config.module";
import { DataSourceModule } from "@data-source/data-source.module";
import { CrawlerModule } from "@crawler/crawler.module";
import { BoardModule } from "@board/board.module";
import { AttachmentModule } from "@attachment/attachment.module";
import { DatabaseModule } from "@database/database.module";
import { StorageModule } from "@storage/storage.module";

import { PostModule } from "@post/post.module";
import { PostService } from "@post/post.service";

import { createGraphQLContext } from "@utils/graphql";
import { AttachmentService } from "@attachment/attachment.service";

@Module({})
export class AppModule {
    public static forRoot(config: Config, dropDatabase: boolean): DynamicModule {
        const imports: DynamicModule[] = [];
        if (config.api?.type === "graphql") {
            const { endpoint = "/graphql", playground = true } = config.api;

            imports.push(
                GraphQLModule.forRootAsync({
                    driver: ApolloDriver,
                    inject: [PostService, AttachmentService],
                    useFactory: (postService: PostService, attachmentService: AttachmentService) => ({
                        path: endpoint,
                        playground,

                        autoSchemaFile:
                            process.env.NODE_ENV === "development"
                                ? path.join(process.cwd(), "./schema.graphql")
                                : true,

                        context: () => createGraphQLContext(postService, attachmentService),
                    }),
                    imports: [PostModule, AttachmentModule],
                }),
            );
        }

        return {
            module: AppModule,
            imports: [
                ...imports,
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
