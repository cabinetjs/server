import { Test, TestingModule } from "@nestjs/testing";

import { PostResolver } from "@post/post.resolver";
import { PostService } from "@post/post.service";

describe("PostResolver", () => {
    let resolver: PostResolver;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PostResolver, { provide: PostService, useValue: {} }],
        }).compile();

        resolver = module.get<PostResolver>(PostResolver);
    });

    it("should be defined", () => {
        expect(resolver).toBeDefined();
    });
});
