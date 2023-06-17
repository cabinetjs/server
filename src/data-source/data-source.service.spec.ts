import { Test, TestingModule } from "@nestjs/testing";

import { DataSourceService } from "@data-source/data-source.service";

import { configMock } from "../../test/config.mock";

describe("DataSourceService", () => {
    let service: DataSourceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DataSourceService, configMock],
        }).compile();

        service = module.get<DataSourceService>(DataSourceService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
