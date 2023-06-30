import { BaseEntity } from "typeorm";
import { GraphQLBigInt } from "graphql-scalars";

import { Field, Int, ObjectType } from "@nestjs/graphql";

import { CrawlerLog } from "@crawler/models/crawler-log.model";

import { Nullable } from "@utils/types";

@ObjectType()
export class Statistic extends BaseEntity {
    @Field(() => Int)
    public boardCount!: number;

    @Field(() => Int)
    public postCount!: number;

    @Field(() => Int)
    public attachmentCount!: number;

    @Field(() => GraphQLBigInt)
    public fileSize!: number;

    @Field(() => CrawlerLog, { nullable: true })
    public lastCrawlingLog?: Nullable<CrawlerLog>;

    @Field(() => Int)
    public oldBoardCount!: number;

    @Field(() => Int)
    public oldPostCount!: number;

    @Field(() => Int)
    public oldAttachmentCount!: number;

    @Field(() => GraphQLBigInt)
    public oldFileSize!: number;
}
