import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, RelationId } from "typeorm";

import { Field, ObjectType } from "@nestjs/graphql";

import { Post, RawPost } from "@post/models/post.model";

import { AsRawType } from "@utils/types";

@ObjectType()
@Entity({ name: "boards" })
export class Board extends BaseEntity {
    @Field(() => String)
    @PrimaryGeneratedColumn("uuid")
    public id!: string;

    @Field(() => String)
    @Column({ type: "varchar", length: 255, unique: true })
    public uri!: string;

    @Field(() => String)
    @Column({ type: "varchar", length: 255 })
    public code!: string;

    @Field(() => String)
    @Column({ type: "varchar", length: 255 })
    public name!: string;

    @Field(() => String, { nullable: true })
    @Column({ type: "text", nullable: true })
    public description?: string;

    @Field(() => Date)
    @CreateDateColumn()
    public createdAt!: Date;

    // Board => Post[]
    @OneToMany(() => Post, item => item.board)
    public posts!: Post[];

    @RelationId((item: Board) => item.posts)
    public postIds!: Post["uri"][];
}

export type RawBoard = Omit<AsRawType<Board>, "id"> & {
    posts: RawPost[];
};
