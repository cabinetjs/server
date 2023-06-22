import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";

import { Field, Int, ObjectType } from "@nestjs/graphql";

import { Attachment } from "@attachment/models/attachment.model";

@ObjectType()
@Entity({ name: "thumbnail" })
export class Thumbnail extends BaseEntity {
    @Field(() => String)
    @PrimaryGeneratedColumn("uuid")
    public id!: string;

    @Field(() => Int)
    @Column({ type: "int" })
    public width!: number;

    @Field(() => Int)
    @Column({ type: "int" })
    public height!: number;

    @Field(() => Int)
    @Column({ type: "int" })
    public size!: number;

    @Field(() => Int)
    @Column({ type: "int" })
    public filesize!: number;

    @Column({ type: "varchar", length: 255 })
    public path!: string;

    @CreateDateColumn()
    public createdAt!: Date;

    // Thumbnail[] => Attachment
    @ManyToOne(() => Attachment, item => item.thumbnails)
    public attachment!: Attachment;

    @RelationId((item: Thumbnail) => item.attachment)
    public attachmentId!: Attachment["uri"];
}
