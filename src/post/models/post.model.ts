import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Field, Int, ObjectType } from "@nestjs/graphql";

import { Board } from "@board/models/board.model";
import { Attachment, RawAttachment } from "@attachment/models/attachment.model";

import { AsRawType, Nullable } from "@utils/types";

@ObjectType()
@Entity({ name: "posts" })
export class Post extends BaseEntity {
    @Field(() => String)
    @PrimaryGeneratedColumn("uuid")
    public id!: string;

    @Field(() => String)
    @Column({ type: "varchar", length: 255, unique: true })
    public uri!: string;

    @Field(() => String, { nullable: true })
    @Column({ type: "int", nullable: true })
    public parent?: Nullable<string>;

    @Field(() => Int)
    @Column({ type: "int" })
    public no!: number;

    @Field(() => String, { nullable: true })
    @Column({ type: "text", nullable: true })
    public title?: Nullable<string>;

    @Field(() => String, { nullable: true })
    @Column({ type: "text", nullable: true })
    public content?: Nullable<string>;

    @Field(() => Date)
    @Column({ type: "datetime" })
    public writtenAt!: Date;

    // Post[] => Board
    @ManyToOne(() => Board, item => item.posts)
    public board!: Board;

    // Post => Attachment[]
    @OneToMany(() => Attachment, item => item.post)
    public attachments!: Attachment[];
}

export type RawPost = Omit<AsRawType<Post>, "id"> & {
    attachments: RawAttachment[];
};
