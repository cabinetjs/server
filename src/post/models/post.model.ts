import { Entity, BaseEntity, Column, ManyToOne, RelationId, PrimaryColumn, OneToMany } from "typeorm";

import { Thread } from "@thread/models/thread.model";
import { Attachment, RawAttachment } from "@attachment/models/attachment.model";

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

    // Post => Attachment[]
    @OneToMany(() => Attachment, item => item.post)
    public attachments!: Attachment[];

    @RelationId((item: Post) => item.attachments)
    public attachmentIds!: Attachment["id"][];
}

export type RawPost = AsRawType<Post> & {
    attachments: RawAttachment[];
};
