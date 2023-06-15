import { Entity, BaseEntity, Column, ManyToOne, RelationId, PrimaryColumn } from "typeorm";

import { Post } from "@post/models/post.model";

import { AsRawType } from "@utils/types";

@Entity({ name: "attachments" })
export class Attachment extends BaseEntity {
    @PrimaryColumn({ type: "varchar", length: 255 })
    public id!: string;

    @Column({ type: "text" })
    public url!: string;

    @Column({ type: "int" })
    public size!: number;

    @Column({ type: "text" })
    public name!: string;

    @Column({ type: "text" })
    public extension!: string;

    @Column({ type: "varchar", length: 255 })
    public hash!: string;

    // Attachment[] => Post
    @ManyToOne(() => Post, item => item.attachments)
    public post!: Post;

    @RelationId((item: Attachment) => item.post)
    public postId!: Post["id"];
}

export type RawAttachment = AsRawType<Attachment>;
