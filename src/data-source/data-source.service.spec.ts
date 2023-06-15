import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";

import { DataSourceService } from "@data-source/data-source.service";
import { DataSource } from "@data-source/models/data-source.model";

import { configMock } from "../../test/config.mock";
import { repositoryMockFactory } from "../../test/repository.mock";

describe("DataSourceService", () => {
    let service: DataSourceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DataSourceService,
                configMock,
                { provide: getRepositoryToken(DataSource), useFactory: repositoryMockFactory },
            ],
        }).compile();

        service = module.get<DataSourceService>(DataSourceService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
