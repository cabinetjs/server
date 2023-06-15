import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "data-sources" })
export class DataSource extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    public id!: number;

    @Column({ type: "varchar", length: 255 })
    public type!: string;

    @Column({ type: "varchar", length: 255 })
    public name!: string;
}
