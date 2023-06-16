import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";

import { Board } from "@board/models/board.model";
import { Attachment, RawAttachment } from "@attachment/models/attachment.model";

import { AsRawType, Nullable } from "@utils/types";

@Entity({ name: "posts" })
export class Post extends BaseEntity {
    @PrimaryColumn({ type: "varchar", length: 255 })
    public id!: string;

    @Column({ type: "int", nullable: true })
    public parent?: Nullable<string>;

    @Column({ type: "int" })
    public no!: number;

    @Column({ type: "text", nullable: true })
    public title?: Nullable<string>;

    @Column({ type: "text", nullable: true })
    public content?: Nullable<string>;

    // Post[] => Board
    @ManyToOne(() => Board, item => item.posts)
    public board!: Board;

    // Post => Attachment[]
    @OneToMany(() => Attachment, item => item.post)
    public attachments!: Attachment[];
}

export type RawPost = AsRawType<Post> & {
    attachments: RawAttachment[];
};
