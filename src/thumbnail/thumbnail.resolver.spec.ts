import { Test, TestingModule } from "@nestjs/testing";
import { ThumbnailResolver } from "@thumbnail/thumbnail.resolver";
import { CONFIG_DATA } from "@config/config.module";

import { configMockFactory } from "../../test/config.mock";

describe("ThumbnailResolver", () => {
    let resolver: ThumbnailResolver;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ThumbnailResolver, { provide: CONFIG_DATA, useFactory: configMockFactory }],
        }).compile();

        resolver = module.get<ThumbnailResolver>(ThumbnailResolver);
    });

    it("should be defined", () => {
        expect(resolver).toBeDefined();
    });
});
