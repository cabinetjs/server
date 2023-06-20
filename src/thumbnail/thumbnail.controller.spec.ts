import { Test, TestingModule } from "@nestjs/testing";

import { ThumbnailController } from "@thumbnail/thumbnail.controller";
import { ThumbnailService } from "@thumbnail/thumbnail.service";
import { AttachmentService } from "@attachment/attachment.service";

describe("ThumbnailController", () => {
    let controller: ThumbnailController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ThumbnailController],
            providers: [
                { provide: ThumbnailService, useValue: {} },
                { provide: AttachmentService, useValue: {} },
            ],
        }).compile();

        controller = module.get<ThumbnailController>(ThumbnailController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
