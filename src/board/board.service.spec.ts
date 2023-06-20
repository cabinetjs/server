import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";

import { BoardService } from "@board/board.service";
import { Board } from "@board/models/board.model";

import { PostService } from "@post/post.service";
import { AttachmentService } from "@attachment/attachment.service";

import { repositoryMockFactory } from "../../test/repository.mock";

describe("BoardService", () => {
    let service: BoardService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BoardService,
                { provide: getRepositoryToken(Board), useFactory: repositoryMockFactory },
                { provide: PostService, useValue: {} },
                { provide: AttachmentService, useValue: {} },
            ],
        }).compile();

        service = module.get<BoardService>(BoardService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
