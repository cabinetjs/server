import { DataSource, Repository } from "typeorm";

import { DataSource as DataSourceEntity } from "@database/models/data-source.model";
import { Article as ArticleEntity } from "@database/models/article.model";
import { Comment as CommentEntity } from "@database/models/comment.model";
import { Board as BoardEntity } from "@database/models/board.model";

import { BaseDataSource } from "@data-source/base";

import { Logger } from "@utils/logger";

export class Database {
    private static readonly logger = new Logger(Database.name);

    public static initialize(): Promise<Database> {
        return this.logger.doWork({
            level: "log",
            message: "Initialize database",
            work: async () => {
                const dataSource = new DataSource({
                    type: "sqlite",
                    database: "database.sqlite",
                    entities: [DataSourceEntity, ArticleEntity, CommentEntity, BoardEntity],
                    synchronize: true,
                    dropSchema: true,
                });

                await dataSource.initialize();

                return new Database(dataSource);
            },
        });
    }

    private readonly dataSourceRepository: Repository<DataSourceEntity>;
    private readonly boardRepository: Repository<BoardEntity>;
    private readonly articleRepository: Repository<ArticleEntity>;
    private readonly commentRepository: Repository<CommentEntity>;

    private get logger(): Logger {
        return Database.logger;
    }

    private constructor(dataSource: DataSource) {
        this.dataSourceRepository = dataSource.getRepository(DataSourceEntity);
        this.boardRepository = dataSource.getRepository(BoardEntity);
        this.articleRepository = dataSource.getRepository(ArticleEntity);
        this.commentRepository = dataSource.getRepository(CommentEntity);
    }

    public async getDataSource(type: string, name: string) {
        const data = await this.dataSourceRepository.findOneBy({ type, name });
        if (!data) {
            throw new Error(`Data source entity with name '${name}' not found.`);
        }

        return data;
    }
    public saveDataSource(type: string, name: string) {
        return this.logger.doWork({
            level: "log",
            message: `Save {cyan} data source to database`,
            args: [`'${name}'`],
            work: () => {
                const dataSourceEntity = this.dataSourceRepository.create({
                    type,
                    name,
                });

                return this.dataSourceRepository.save(dataSourceEntity);
            },
        });
    }

    public async saveBoards({ type, name }: BaseDataSource, boards: BoardEntity[]) {
        const source = await this.getDataSource(type, name);
        for (const board of boards) {
            board.dataSource = source;
        }

        const articles = boards.flatMap(board => board.articles);
        const comments = articles.flatMap(article => article.comments);

        await this.logger.doWork({
            level: "log",
            message: "Save {cyan} boards, {cyan} articles, {cyan} comments to database",
            args: [boards.length, articles.length, comments.length],
            work: async () => {
                await this.commentRepository.save(comments);
                await this.articleRepository.save(articles);
                await this.boardRepository.save(boards);
            },
        });
    }
}
