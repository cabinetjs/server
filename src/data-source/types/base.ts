import { pascalCase } from "change-case";

import { RawBoard } from "@board/models/board.model";

import { Logger } from "@utils/logger";

export interface BaseDataSourceOption<Type extends string> {
    type: Type;
    name: string;
}

export abstract class BaseDataSource<
    Type extends string = string,
    TOptions extends BaseDataSourceOption<Type> = BaseDataSourceOption<Type>,
> {
    protected readonly logger: Logger;
    protected readonly options: TOptions;
    public readonly type: Type;

    public get name(): string {
        return this.options.name;
    }

    protected constructor(type: Type, options: TOptions) {
        this.type = type;
        this.options = options;
        this.logger = new Logger(pascalCase(this.type));
    }

    protected abstract doInitialize(): Promise<void>;
    protected abstract doCrawl(): Promise<RawBoard[]>;

    public async initialize(): Promise<void> {
        await this.logger.doWork({
            level: "log",
            message: "Initialize data source {cyan}",
            args: [`'${this.options.name}'`],
            work: () => this.doInitialize(),
        });
    }

    public async crawl(): Promise<RawBoard[]> {
        return this.logger.doWork({
            level: "log",
            message: "Crawling data from data source {cyan}",
            args: [`'${this.options.name}'`],
            work: () => this.doCrawl(),
        });
    }
}
