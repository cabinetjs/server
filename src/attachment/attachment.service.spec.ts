import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";

import { AttachmentService } from "@attachment/attachment.service";
import { Attachment } from "@attachment/models/attachment.model";

import { StorageService } from "@storage/storage.service";

import { repositoryMockFactory } from "../../test/repository.mock";

describe("AttachmentService", () => {
    let service: AttachmentService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AttachmentService,
                { provide: getRepositoryToken(Attachment), useFactory: repositoryMockFactory },
                { provide: StorageService, useValue: {} },
            ],
        }).compile();

        service = module.get<AttachmentService>(AttachmentService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
