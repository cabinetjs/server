import { Entity, BaseEntity, RelationId, ManyToOne, OneToOne, JoinColumn, OneToMany, PrimaryColumn } from "typeorm";

import { Board } from "@board/models/board.model";
import { Post, RawPost } from "@post/models/post.model";

import { AsRawType } from "@utils/types";

@Entity({ name: "threads" })
export class Thread extends BaseEntity {
    @PrimaryColumn({ type: "varchar", length: 255 })
    public id!: string;

    // Thread => Post
    @OneToOne(() => Post)
    @JoinColumn()
    public openingPost!: Post;

    @RelationId((item: Thread) => item.openingPost)
    public openingPostId!: Post["id"];

    // Thread => Post[]
    @OneToMany(() => Post, item => item.thread)
    public replies!: Post[];

    @RelationId((item: Thread) => item.replies)
    public replyIds!: Post["id"][];

    // Thread[] => Board
    @ManyToOne(() => Board, item => item.threads)
    public board!: Board;

    @RelationId((item: Thread) => item.board)
    public boardId!: Board["id"];
}

export type RawThread = AsRawType<Thread> & {
    openingPost: RawPost;
    replies: RawPost[];
};
