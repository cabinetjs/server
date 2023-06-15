import { Test, TestingModule } from "@nestjs/testing";

import { DatabaseService } from "@database/database.service";
import { BoardService } from "@board/board.service";
import { ThreadService } from "@thread/thread.service";
import { PostService } from "@post/post.service";
import { AttachmentService } from "@attachment/attachment.service";

describe("DatabaseService", () => {
    let service: DatabaseService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                {
                    module: class FakeModule {},
                    providers: [
                        { provide: BoardService, useValue: {} },
                        { provide: ThreadService, useValue: {} },
                        { provide: PostService, useValue: {} },
                        { provide: AttachmentService, useValue: {} },
                    ],
                    exports: [BoardService, ThreadService, PostService, AttachmentService],
                },
            ],
            providers: [DatabaseService],
        }).compile();

        service = module.get<DatabaseService>(DatabaseService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
