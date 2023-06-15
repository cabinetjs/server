import { Inject, Injectable } from "@nestjs/common";

import { ThreadService } from "@thread/thread.service";
import { AttachmentService } from "@attachment/attachment.service";

import { BoardService } from "@board/board.service";
import { RawBoard } from "@board/models/board.model";

import { PostService } from "@post/post.service";

import { Logger } from "@utils/logger";

@Injectable()
export class DatabaseService {
    private readonly logger = new Logger(DatabaseService.name);

    public constructor(
        @Inject(BoardService) private readonly boardService: BoardService,
        @Inject(ThreadService) private readonly threadService: ThreadService,
        @Inject(PostService) private readonly postService: PostService,
        @Inject(AttachmentService) private readonly attachmentService: AttachmentService,
    ) {}

    public async write(dataSourceName: string, boards: RawBoard[]) {
        const threads = boards.flatMap(board => board.threads);
        const posts = threads.flatMap(thread => [thread.openingPost, ...thread.replies]);

        await this.logger.doWork({
            level: "log",
            message: `Writing {cyan} posts into database`,
            args: [posts.length],
            work: async () => {
                const attachments = posts.flatMap(post => post.attachments);

                await this.attachmentService.save(attachments);
                await this.postService.save(posts);
                await this.threadService.save(threads);

                const boardMap = await this.boardService.getIdMap();
                boards = boards.map(board => {
                    return {
                        ...board,
                        threads: [...(boardMap[board.id]?.threads ?? []), ...threads],
                    };
                });

                await this.boardService.save(boards);
            },
        });
    }
}
