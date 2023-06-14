import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    RelationId,
    UpdateDateColumn,
} from "typeorm";

import { Article } from "@database/models/article.model";

import { Nullable } from "@utils/types";

@Entity({ name: "comment" })
export class Comment extends BaseEntity {
    public static fromRawData(comment: MinimalComment) {
        const instance = new Comment();
        instance.no = comment.no;
        instance.content = comment.content;

        return instance;
    }

    @PrimaryGeneratedColumn("uuid")
    public id!: string;

    @PrimaryColumn({ type: "int" })
    public no!: number;

    @Column({ type: "text", nullable: true })
    public content?: Nullable<string>;

    @CreateDateColumn()
    public createdAt!: Date;

    @UpdateDateColumn()
    public updatedAt!: Date;

    // Comment[] => Article
    @ManyToOne(() => Article, item => item.comments)
    public article!: Article;

    @RelationId((item: Comment) => item.article)
    public articleId!: Article["id"];
}

export interface MinimalComment {
    no: number;
    content?: Nullable<string>;
}
