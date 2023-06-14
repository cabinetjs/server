import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryColumn,
    RelationId,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    ManyToOne,
} from "typeorm";

import { Board } from "@database/models/board.model";
import { Comment, MinimalComment } from "@database/models/comment.model";

import { Nullable } from "@utils/types";

@Entity({ name: "article" })
export class Article extends BaseEntity {
    public static fromRawData(rawData: MinimalArticle): Article {
        const article = new Article();
        article.no = rawData.no;
        article.title = rawData.title;
        article.content = rawData.content;
        article.comments = rawData.comments.map(comment => Comment.fromRawData(comment));

        return article;
    }

    @PrimaryGeneratedColumn("uuid")
    public id!: string;

    @PrimaryColumn({ type: "int" })
    public no!: number;

    @Column({ type: "text", nullable: true })
    public title?: Nullable<string>;

    @Column({ type: "text", nullable: true })
    public content?: Nullable<string>;

    @CreateDateColumn()
    public createdAt!: Date;

    @UpdateDateColumn()
    public updatedAt!: Date;

    // Article => Comment[]
    @OneToMany(() => Comment, item => item.article)
    public comments!: Comment[];

    @RelationId((item: Article) => item.comments)
    public commentIds!: Comment["id"];

    // Article[] => Board
    @ManyToOne(() => Board, item => item.articles)
    public board!: Board;

    @RelationId((item: Article) => item.board)
    public boardId!: Board["id"];
}

export interface MinimalArticle {
    no: number;
    title?: Nullable<string>;
    content?: Nullable<string>;
    comments: MinimalComment[];
}
