import { Database } from "@database";
import { Board, MinimalBoard } from "@database/models/board.model";

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
        this.logger = new Logger(this.type);
    }

    protected abstract doInitialize(): Promise<void>;
    protected abstract doCrawl(): Promise<MinimalBoard[]>;

    public async initialize(database: Database): Promise<void> {
        await this.logger.doWork({
            level: "log",
            message: "Initialize data source {cyan}",
            args: [`'${this.options.name}'`],
            work: async () => {
                await database.saveDataSource(this.type, this.name);
                await this.doInitialize();
            },
        });
    }

    public async crawl(): Promise<Board[]> {
        const rawBoards = await this.logger.doWork({
            level: "log",
            message: "Crawling data from data source {cyan}",
            args: [`'${this.options.name}'`],
            work: () => this.doCrawl(),
        });

        const articles = rawBoards.flatMap(board => board.articles);
        const comments = articles.flatMap(article => article.comments);

        this.logger.log(
            "Successfully crawled {cyan} articles and {cyan} comments from {cyan} boards.",
            articles.length,
            comments.length,
            rawBoards.length,
        );

        const boards = rawBoards.map(board => Board.fromRawData(board));
        for (const board of boards) {
            board.id = `${this.type}::${this.name}::${board.uid}`;

            for (const article of board.articles) {
                article.id = `${board.id}::${article.no}`;

                for (const comment of article.comments) {
                    comment.id = `${article.id}::${comment.no}`;
                }
            }
        }

        return boards;
    }
}
