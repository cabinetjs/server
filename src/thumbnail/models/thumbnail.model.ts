import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { Attachment } from "@attachment/models/attachment.model";

@Entity({ name: "thumbnail" })
export class Thumbnail extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    public id!: string;

    @Column({ type: "int" })
    public width!: number;

    @Column({ type: "int" })
    public height!: number;

    @Column({ type: "int" })
    public size!: number;

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
