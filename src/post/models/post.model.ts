import { Entity, BaseEntity, Column, ManyToOne, RelationId, PrimaryColumn } from "typeorm";

import { Thread } from "@thread/models/thread.model";

import { AsRawType, Nullable } from "@utils/types";

@Entity({ name: "posts" })
export class Post extends BaseEntity {
    @PrimaryColumn({ type: "varchar", length: 255 })
    public id!: string;

    @Column({ type: "int" })
    public no!: number;

    @Column({ type: "text", nullable: true })
    public title?: Nullable<string>;

    @Column({ type: "text", nullable: true })
    public content?: Nullable<string>;

    // Post[] => Thread
    @ManyToOne(() => Thread, item => item.replies)
    public thread!: Thread;

    @RelationId((item: Post) => item.thread)
    public threadId!: Thread["id"];
}

export type RawPost = AsRawType<Post>;
