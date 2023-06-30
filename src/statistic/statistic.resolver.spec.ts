import { Test, TestingModule } from "@nestjs/testing";

import { StatisticResolver } from "@statistic/statistic.resolver";
import { StatisticService } from "@statistic/statistic.service";

describe("StatisticResolver", () => {
    let resolver: StatisticResolver;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [StatisticResolver, { provide: StatisticService, useValue: {} }],
        }).compile();

        resolver = module.get<StatisticResolver>(StatisticResolver);
    });

    it("should be defined", () => {
        expect(resolver).toBeDefined();
    });
});
