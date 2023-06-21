import { Test, TestingModule } from "@nestjs/testing";
import { AttachmentController } from "./attachment.controller";
import { AttachmentService } from "@attachment/attachment.service";
import { StorageService } from "@storage/storage.service";

describe("AttachmentController", () => {
    let controller: AttachmentController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                { provide: AttachmentService, useValue: {} },
                { provide: StorageService, useValue: {} },
            ],
            controllers: [AttachmentController],
        }).compile();

        controller = module.get<AttachmentController>(AttachmentController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
