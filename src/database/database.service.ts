import { Inject, Injectable } from "@nestjs/common";

import { AttachmentService } from "@attachment/attachment.service";

import { PostService } from "@post/post.service";
import { RawPost } from "@post/models/post.model";

import { BoardService } from "@board/board.service";
import { RawBoard } from "@board/models/board.model";

import { Logger } from "@utils/logger";
import _ from "lodash";

@Injectable()
export class DatabaseService {
    private readonly logger = new Logger(DatabaseService.name);

    public constructor(
        @Inject(BoardService) private readonly boardService: BoardService,
        @Inject(PostService) private readonly postService: PostService,
        @Inject(AttachmentService) private readonly attachmentService: AttachmentService,
    ) {}

    public async write(boards: RawBoard[]) {
        return this.logger.doWork({
            level: "log",
            message: `Writing crawled data into database`,
            work: () => this.doWrite(boards),
        });
    }

    private async doWrite(boards: RawBoard[]) {
        boards = this.mergeBoards(boards);

        const posts = boards.flatMap(board => board.posts);
        const attachments = posts.flatMap(post => post.attachments);

        return {
            attachments: await this.attachmentService.save(attachments),
            posts: await this.postService.save(posts),
            boards: await this.boardService.save(boards),
        };
    }

    private mergeBoards(boards: RawBoard[]) {
        const result: RawBoard[] = [];
        for (const board of boards) {
            const existingBoard = result.find(b => b.id === board.id);
            if (existingBoard) {
                existingBoard.posts.push(...board.posts);
            } else {
                result.push(board);
            }
        }

        for (const board of result) {
            const postGroups = _.chain(board.posts).groupBy("id").value();
            const postIds = Object.keys(postGroups);

            board.posts = postIds.map<RawPost>(postId => ({
                ..._.merge({}, ...postGroups[postId]),
                attachments: _.chain(postGroups[postId])
                    .flatMap(post => post.attachments)
                    .uniqBy("id")
                    .value(),
            }));
        }

        return result;
    }
}
