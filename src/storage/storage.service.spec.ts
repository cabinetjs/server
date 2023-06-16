import { Test, TestingModule } from "@nestjs/testing";

import { StorageService } from "@storage/storage.service";

import { CONFIG_DATA } from "@config/config.module";

import { configMockFactory } from "../../test/config.mock";
import { AttachmentService } from "@attachment/attachment.service";

describe("StorageService", () => {
    let service: StorageService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StorageService,
                { provide: CONFIG_DATA, useFactory: configMockFactory },
                { provide: AttachmentService, useValue: {} },
            ],
        }).compile();

        service = module.get<StorageService>(StorageService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
