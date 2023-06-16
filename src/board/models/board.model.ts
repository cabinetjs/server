import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn, RelationId } from "typeorm";

import { AsRawType } from "@utils/types";

import { Post, RawPost } from "@post/models/post.model";

@Entity({ name: "boards" })
export class Board extends BaseEntity {
    @PrimaryColumn({ type: "varchar", length: 255 })
    public id!: string;

    @Column({ type: "varchar", length: 255 })
    public code!: string;

    @Column({ type: "varchar", length: 255 })
    public name!: string;

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
