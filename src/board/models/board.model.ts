import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn, RelationId } from "typeorm";

import { Field, ObjectType } from "@nestjs/graphql";

import { Post, RawPost } from "@post/models/post.model";

import { AsRawType } from "@utils/types";

@ObjectType()
@Entity({ name: "boards" })
export class Board extends BaseEntity {
    @Field(() => String)
    @PrimaryColumn({ type: "varchar", length: 255 })
    public id!: string;

    @Field(() => String)
    @Column({ type: "varchar", length: 255 })
    public code!: string;

    @Field(() => String)
    @Column({ type: "varchar", length: 255 })
    public name!: string;

    @Field(() => String)
    @Column({ type: "text" })
    public description!: string;

    // Board => Post[]
    @OneToMany(() => Post, item => item.board)
    public posts!: Post[];

    @RelationId((item: Board) => item.posts)
    public postIds!: Post["id"][];
}

export type RawBoard = AsRawType<Board> & {
    posts: RawPost[];
};
