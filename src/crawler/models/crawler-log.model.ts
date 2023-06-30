import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Field, ObjectType, Int } from "@nestjs/graphql";

@Entity({ name: "crawler-logs" })
@ObjectType()
export class CrawlerLog extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    public id!: number;

    @Field(() => Date)
    @Column({ type: "datetime" })
    public startedAt!: Date;

    @Field(() => Date)
    @Column({ type: "datetime" })
    public finishedAt!: Date;

    @Field(() => Boolean)
    @Column({ type: "boolean" })
    public success!: boolean;

    @Field(() => Int)
    @Column({ type: "int", default: 0 })
    public boardCount!: number;

    @Field(() => Int)
    @Column({ type: "int", default: 0 })
    public postCount!: number;

    @Field(() => Int)
    @Column({ type: "int", default: 0 })
    public attachmentCount!: number;
}
