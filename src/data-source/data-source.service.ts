import { Inject, Injectable, OnApplicationBootstrap } from "@nestjs/common";

import { Config } from "@config/config.module";
import { InjectConfig } from "@config/config.decorator";

import { RawBoard } from "@board/models/board.model";
import { DataSourceModel } from "@data-source/models/data-source.model";

import { PostService } from "@post/post.service";
import { AttachmentService } from "@attachment/attachment.service";

import { BaseDataSource } from "@data-source/types/base";
import { createDataSource } from "@data-source/types";
import { Like } from "typeorm";

@Injectable()
export class DataSourceService implements OnApplicationBootstrap {
    private readonly dataSources: BaseDataSource[] = [];
    private readonly config: Config;

    public constructor(
        @InjectConfig() config: Config,
        @Inject(PostService) private readonly postService: PostService,
        @Inject(AttachmentService) private readonly attachmentService: AttachmentService,
    ) {
        this.config = config;
    }

    public async onApplicationBootstrap() {
        for (const dataSourceOption of this.config.dataSources) {
            const dataSource = createDataSource(dataSourceOption);
            await dataSource.initialize();

            this.dataSources.push(dataSource);
        }
    }

    public async *crawl(): AsyncIterableIterator<[string, RawBoard[]]> {
        for (const dataSource of this.dataSources) {
            const boards = await dataSource.crawl();

            yield [dataSource.name, boards];
        }
    }

    public getRegisteredDataSources(): DataSourceModel[] {
        return this.dataSources.map(item => {
            return {
                id: item.name,
                type: item.type,
            };
        });
    }

    public getPostCount(name: string) {
        return this.postService.count({ id: Like(`${name}%`) });
    }
    public getMediaCount(name: string) {
        return this.attachmentService.count({ id: Like(`${name}%`) });
    }
}
