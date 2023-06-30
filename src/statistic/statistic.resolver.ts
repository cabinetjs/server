import { Inject } from "@nestjs/common";
import { Args, Int, Query, registerEnumType, Resolver } from "@nestjs/graphql";

import { StatisticService } from "@statistic/statistic.service";

import { Statistic } from "@statistic/models/statistic.model";

import { Nullable } from "@utils/types";

export enum TimeSpanUnit {
    Minute = "minute",
    Hour = "hour",
    Day = "day",
    Week = "week",
    Month = "month",
    Year = "year",
}

registerEnumType(TimeSpanUnit, { name: "TimeSpanUnit" });

@Resolver()
export class StatisticResolver {
    public constructor(@Inject(StatisticService) private readonly statisticService: StatisticService) {}

    @Query(() => Statistic)
    public async statistic(
        @Args("date", { type: () => Date, nullable: true }) date: Nullable<Date>,
        @Args("timeSpanValue", { type: () => Int }) timeSpanValue: number,
        @Args("timeSpanUnit", { type: () => TimeSpanUnit }) timeSpanUnit: TimeSpanUnit,
    ): Promise<Statistic> {
        return this.statisticService.getStatistic(date, timeSpanValue, timeSpanUnit);
    }
}
