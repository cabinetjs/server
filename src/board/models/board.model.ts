import { Entity, BaseEntity, Column, OneToMany, RelationId, PrimaryColumn } from "typeorm";

import { RawThread, Thread } from "@thread/models/thread.model";

import { AsRawType } from "@utils/types";

@Entity({ name: "boards" })
export class Board extends BaseEntity {
    @PrimaryColumn({ type: "varchar", length: 255 })
    public id!: string;

    @Column({ type: "varchar", length: 255 })
    public code!: string;

    @Column({ type: "varchar", length: 255 })
    public name!: string;

    @Column({ type: "text" })
    public description!: string;

    // Board => Thread[]
    @OneToMany(() => Thread, item => item.board)
    public threads!: Thread[];

    @RelationId((item: Board) => item.threads)
    public threadIds!: Thread["id"][];
}

export type RawBoard = AsRawType<Board> & {
    threads: RawThread[];
};
