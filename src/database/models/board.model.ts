import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
    RelationId,
    UpdateDateColumn,
} from "typeorm";

import { DataSource } from "@database/models/data-source.model";
import { Article, MinimalArticle } from "@database/models/article.model";

import { Nullable } from "@utils/types";

@Entity({ name: "board" })
export class Board extends BaseEntity {
    public static fromRawData(rawData: MinimalBoard): Board {
        const board = new Board();
        board.uid = rawData.uid;
        board.name = rawData.name;
        board.description = rawData.description;
        board.articles = rawData.articles.map(article => Article.fromRawData(article));

        return board;
    }

    @PrimaryColumn({ type: "varchar", length: 255 })
    public id!: string;

    @PrimaryColumn({ type: "varchar", length: 255 })
    public uid!: string;

    @Column({ type: "text" })
    public name!: string;

    @Column({ type: "text" })
    public description?: Nullable<string>;

    @CreateDateColumn()
    public createdAt!: Date;

    @UpdateDateColumn()
    public updatedAt!: Date;

    // Board[] => DataSource
    @ManyToOne(() => DataSource, item => item.boards)
    public dataSource!: DataSource;

    @RelationId((item: Board) => item.dataSource)
    public dataSourceId!: DataSource["id"];

    // Board => Article[]
    @OneToMany(() => Article, item => item.board)
    public articles!: Article[];

    @RelationId((item: Board) => item.articles)
    public articleIds!: Article["id"];
}

export interface MinimalBoard {
    uid: string;
    name: string;
    description?: Nullable<string>;
    articles: MinimalArticle[];
}
