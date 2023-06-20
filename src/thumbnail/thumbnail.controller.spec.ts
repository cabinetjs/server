import { Test, TestingModule } from "@nestjs/testing";

import { ThumbnailController } from "@thumbnail/thumbnail.controller";

describe("ThumbnailController", () => {
    let controller: ThumbnailController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ThumbnailController],
        }).compile();

        controller = module.get<ThumbnailController>(ThumbnailController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
