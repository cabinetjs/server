import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { EventEmitter2 } from "@nestjs/event-emitter";

import { CrawlerService } from "@crawler/crawler.service";
import { DatabaseService } from "@database/database.service";
import { DataSourceService } from "@data-source/data-source.service";

import { CrawlerLog } from "@crawler/models/crawler-log.model";

import { configMock } from "../../test/config.mock";
import { repositoryMockFactory } from "../../test/repository.mock";

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
            providers: [
                CrawlerService,
                configMock,
                { provide: EventEmitter2, useValue: {} },
                { provide: getRepositoryToken(CrawlerLog), useFactory: repositoryMockFactory },
            ],
        }).compile();

        service = module.get<CrawlerService>(CrawlerService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
