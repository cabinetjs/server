import path from "path";
import fs from "fs-extra";
import { BigIntResolver } from "graphql-scalars";

import { DynamicModule, Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver } from "@nestjs/apollo";
import { ServeStaticModule } from "@nestjs/serve-static";

import { Config, ConfigModule } from "@config/config.module";
import { DataSourceModule } from "@data-source/data-source.module";
import { CrawlerModule } from "@crawler/crawler.module";
import { BoardModule } from "@board/board.module";
import { DatabaseModule } from "@database/database.module";
import { StorageModule } from "@storage/storage.module";
import { ThumbnailModule } from "@thumbnail/thumbnail.module";
import { StatisticModule } from "@statistic/statistic.module";

import { PostModule } from "@post/post.module";
import { PostService } from "@post/post.service";

import { AttachmentModule } from "@attachment/attachment.module";
import { AttachmentService } from "@attachment/attachment.service";

import { createGraphQLContext } from "@utils/graphql";
import { ThumbnailService } from "@thumbnail/thumbnail.service";

const GRAPHQL_SCHEMA_PATH = path.join(process.cwd(), "./schema.graphql");
const CLIENT_ROOT = path.join(process.cwd(), "../web-client");

@Module({})
export class AppModule implements OnModuleInit {
    public static forRoot(config: Config, dropDatabase: boolean, databasePath: string): DynamicModule {
        const imports: DynamicModule[] = [];
        if (config.api?.type === "graphql") {
            const { endpoint = "/graphql", playground = true } = config.api;

            imports.push(
                GraphQLModule.forRootAsync({
                    driver: ApolloDriver,
                    inject: [PostService, AttachmentService, ThumbnailService],
                    useFactory: (
                        postService: PostService,
                        attachmentService: AttachmentService,
                        thumbnailService: ThumbnailService,
                    ) => ({
                        path: endpoint,
                        playground,
                        autoSchemaFile: process.env.NODE_ENV === "development" ? GRAPHQL_SCHEMA_PATH : true,
                        context: () => createGraphQLContext(postService, attachmentService, thumbnailService),
                        definitions: {
                            customScalarTypeMapping: {
                                BigInt: "bigint",
                            },
                        },
                        resolvers: {
                            BigInt: BigIntResolver,
                        },
                    }),
                    imports: [PostModule, AttachmentModule, ThumbnailModule],
                }),
            );
        }

        let thumbnailPath = config.thumbnailPath || "./thumbnails";
        if (!path.isAbsolute(thumbnailPath)) {
            thumbnailPath = path.join(process.cwd(), thumbnailPath);
        }

        return {
            module: AppModule,
            imports: [
                ...imports,
                ServeStaticModule.forRoot({
                    rootPath: thumbnailPath,
                    serveRoot: "/thumbnails",
                }),
                ConfigModule.forRoot(config),
                TypeOrmModule.forRoot({
                    type: "sqlite",
                    database: databasePath,
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
                ThumbnailModule,
                StatisticModule,
            ],
        };
    }

    public async onModuleInit() {
        if (process.env.NODE_ENV === "development") {
            await fs.copy(GRAPHQL_SCHEMA_PATH, path.join(CLIENT_ROOT, "./schema.gql"));
        }
    }
}
