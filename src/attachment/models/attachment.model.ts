import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Field, Int, ObjectType } from "@nestjs/graphql";

import { Post } from "@post/models/post.model";
import { Thumbnail } from "@thumbnail/models/thumbnail.model";

import { AsRawType, Nullable } from "@utils/types";

@ObjectType()
@Entity({ name: "attachments" })
export class Attachment extends BaseEntity {
    public static compare(left: Attachment | RawAttachment, right: Attachment | RawAttachment): boolean {
        return !(
            left.uri !== right.uri ||
            left.uid !== right.uid ||
            left.url !== right.url ||
            left.size !== right.size ||
            left.name !== right.name ||
            left.hash !== right.hash
        );
    }

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

    @Field(() => Int, { nullable: true })
    @Column({ type: "int", nullable: true })
    public width?: number;

    @Field(() => Int, { nullable: true })
    @Column({ type: "int", nullable: true })
    public height?: number;

    @Field(() => String, { nullable: true })
    @Column({ type: "varchar", length: 255, nullable: true })
    public mimeType?: Nullable<string>;

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
