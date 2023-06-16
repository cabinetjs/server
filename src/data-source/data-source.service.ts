import { Injectable, OnApplicationBootstrap } from "@nestjs/common";

import { Config } from "@config/config.module";
import { InjectConfig } from "@config/config.decorator";

import { RawBoard } from "@board/models/board.model";

import { BaseDataSource } from "@data-source/types/base";
import { createDataSource } from "@data-source/types";

@Injectable()
export class DataSourceService implements OnApplicationBootstrap {
    private readonly dataSources: BaseDataSource[] = [];
    private readonly config: Config;

    public constructor(@InjectConfig() config: Config) {
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
}
