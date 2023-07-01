import { GraphQLBigInt } from "graphql-scalars";

import { Field, ObjectType, Int } from "@nestjs/graphql";

@ObjectType()
export class AttachmentStatus {
    @Field(() => Int)
    public count!: number;

    @Field(() => Int)
    public countDelta!: number;

    @Field(() => GraphQLBigInt)
    public fileSize!: number;

    @Field(() => GraphQLBigInt)
    public fileSizeDelta!: number;
}
