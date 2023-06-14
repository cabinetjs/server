import { KebabCase, CamelCase } from "type-fest";

import { Logger } from "@utils/logger";
import { Article } from "@utils/types";

export interface BaseDataSourceOption<Type extends string> {
    type: KebabCase<CamelCase<Type>>;
    name: string;
}

export abstract class BaseDataSource<
    Type extends string,
    TOptions extends BaseDataSourceOption<Type> = BaseDataSourceOption<Type>,
> {
    protected readonly type: Type;
    protected readonly logger: Logger;
    protected readonly options: TOptions;

    protected constructor(type: Type, options: TOptions) {
        this.type = type;
        this.options = options;
        this.logger = new Logger(this.type);
    }

    protected abstract doInitialize(): Promise<void>;
    protected abstract doCrawl(): Promise<Article[]>;

    public async initialize(): Promise<void> {
        await this.logger.doWork({
            level: "log",
            message: "Initialize data source {cyan}",
            args: [`'${this.options.name}'`],
            work: () => this.doInitialize(),
        });
    }

    public async crawl(): Promise<Article[]> {
        const articles = await this.logger.doWork({
            level: "log",
            message: "Crawling data from data source {cyan}",
            args: [`'${this.options.name}'`],
            work: () => this.doCrawl(),
        });

        const comments = articles.flatMap(article => article.comments);

        this.logger.log("Successfully crawled {cyan} articles and {cyan} comments.", articles.length, comments.length);
        return articles;
    }
}
