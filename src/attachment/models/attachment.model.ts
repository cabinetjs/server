import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Field, Int, ObjectType } from "@nestjs/graphql";

import { Post } from "@post/models/post.model";
import { Thumbnail } from "@thumbnail/models/thumbnail.model";

import { AsRawType, Nullable } from "@utils/types";

@ObjectType()
@Entity({ name: "attachments" })
export class Attachment extends BaseEntity {
    @Field(() => String)
    @PrimaryGeneratedColumn("uuid")
    public id!: string;

    @Field(() => String)
    @Column({ type: "varchar", length: 255, unique: true })
    public uri!: string;

    @Field(() => String)
    @Column({ type: "varchar", length: 255 })
    public uid!: string;

    @Field(() => String)
    @Column({ type: "text" })
    public url!: string;

    @Field(() => String, { nullable: true })
    @Column({ type: "text", nullable: true })
    public thumbnailUrl?: Nullable<string>;

    @Field(() => Int)
    @Column({ type: "int" })
    public size!: number;

    @Field(() => String)
    @Column({ type: "text" })
    public name!: string;

    @Field(() => String)
    @Column({ type: "text" })
    public extension!: string;

    @Field(() => String)
    @Column({ type: "varchar", length: 255 })
    public hash!: string;

    @Column({ type: "boolean", default: false })
    public isStored?: boolean;

    @Column({ type: "text", nullable: true })
    public storageData?: Nullable<string>;

    @Column({ type: "datetime", nullable: true })
    public storedAt?: Nullable<Date>;

    @CreateDateColumn()
    public createdAt!: Date;

    // Attachment[] => Post
    @ManyToOne(() => Post, item => item.attachments)
    public post!: Post;

    // Attachment => Thumbnail[]
    @OneToMany(() => Thumbnail, item => item.attachment)
    public thumbnails!: Thumbnail[];
}

export type RawAttachment = Omit<AsRawType<Attachment>, "id">;
