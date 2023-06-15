import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";

import { ThreadService } from "@thread/thread.service";
import { Thread } from "@thread/models/thread.model";

import { repositoryMockFactory } from "../../test/repository.mock";

describe("ThreadService", () => {
    let service: ThreadService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ThreadService, { provide: getRepositoryToken(Thread), useFactory: repositoryMockFactory }],
        }).compile();

        service = module.get<ThreadService>(ThreadService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
