import {
    BaseEntity,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    RelationId,
    UpdateDateColumn,
} from "typeorm";

import { Board } from "@database/models/board.model";

@Entity({ name: "data-source" })
export class DataSource extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    public id!: string;

    @PrimaryColumn({ type: "varchar", length: 255 })
    public type!: string;

    @PrimaryColumn({ type: "varchar", length: 255 })
    public name!: string;

    @CreateDateColumn()
    public createdAt!: Date;

    @UpdateDateColumn()
    public updatedAt!: Date;

    // DataSource => Board[]
    @OneToMany(() => Board, item => item.dataSource)
    public boards!: Board[];

    @RelationId((item: DataSource) => item.boards)
    public boardIds!: Board["id"];
}
