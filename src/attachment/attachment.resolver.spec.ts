import { Test, TestingModule } from "@nestjs/testing";
import { AttachmentResolver } from "@attachment/attachment.resolver";
import { ThumbnailService } from "@thumbnail/thumbnail.service";

describe("AttachmentResolver", () => {
    let resolver: AttachmentResolver;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AttachmentResolver, { provide: ThumbnailService, useValue: {} }],
        }).compile();

        resolver = module.get<AttachmentResolver>(AttachmentResolver);
    });

    it("should be defined", () => {
        expect(resolver).toBeDefined();
    });
});
