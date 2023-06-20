import { getRepositoryToken } from "@nestjs/typeorm";
import { Test, TestingModule } from "@nestjs/testing";

import { CONFIG_DATA } from "@config/config.module";
import { Thumbnail } from "@thumbnail/models/thumbnail.model";
import { ThumbnailService } from "@thumbnail/thumbnail.service";
import { StorageService } from "@storage/storage.service";

import { configMockFactory } from "../../test/config.mock";
import { repositoryMockFactory } from "../../test/repository.mock";

describe("ThumbnailService", () => {
    let service: ThumbnailService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ThumbnailService,
                { provide: CONFIG_DATA, useFactory: configMockFactory },
                { provide: getRepositoryToken(Thumbnail), useFactory: repositoryMockFactory },
                { provide: StorageService, useValue: {} },
            ],
        }).compile();

        service = module.get<ThumbnailService>(ThumbnailService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
