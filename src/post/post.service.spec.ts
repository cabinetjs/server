import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";

import { PostService } from "@post/post.service";
import { Post } from "@post/models/post.model";

import { repositoryMockFactory } from "../../test/repository.mock";

describe("PostService", () => {
    let service: PostService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PostService, { provide: getRepositoryToken(Post), useFactory: repositoryMockFactory }],
        }).compile();

        service = module.get<PostService>(PostService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
