import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType("DataSource")
export class DataSourceModel {
    @Field(() => String)
    public id!: string;

    @Field(() => String)
    public type!: string;
}
