import { Test, TestingModule } from "@nestjs/testing";

import { CrawlerService } from "@crawler/crawler.service";
import { DatabaseService } from "@database/database.service";
import { DataSourceService } from "@data-source/data-source.service";

import { configMock } from "../../test/config.mock";

describe("CrawlerService", () => {
    let service: CrawlerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                {
                    module: class FakeModule {},
                    providers: [
                        { provide: DatabaseService, useValue: {} },
                        { provide: DataSourceService, useValue: {} },
                    ],
                    exports: [DatabaseService, DataSourceService],
                },
            ],
            providers: [CrawlerService, configMock],
        }).compile();

        service = module.get<CrawlerService>(CrawlerService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
