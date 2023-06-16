import _ from "lodash";
import { Inject, Injectable } from "@nestjs/common";

import { AttachmentService } from "@attachment/attachment.service";
import { PostService } from "@post/post.service";

import { ThreadService } from "@thread/thread.service";
import { RawThread } from "@thread/models/thread.model";

import { BoardService } from "@board/board.service";
import { RawBoard } from "@board/models/board.model";

import { Logger } from "@utils/logger";
import { RawPost } from "@post/models/post.model";
import { isEqual } from "@utils/object";

@Injectable()
export class DatabaseService {
    private readonly logger = new Logger(DatabaseService.name);

    public constructor(
        @Inject(BoardService) private readonly boardService: BoardService,
        @Inject(ThreadService) private readonly threadService: ThreadService,
        @Inject(PostService) private readonly postService: PostService,
        @Inject(AttachmentService) private readonly attachmentService: AttachmentService,
    ) {}

    private mergeBoards(boards: RawBoard[]) {
        const boardMap = _.groupBy(boards, "id");
        const results: RawBoard[] = [];
        for (const [, boards] of Object.entries(boardMap)) {
            let mergedBoard: RawBoard = boards[0];
            for (const board of boards.slice(1)) {
                mergedBoard = _.mergeWith(mergedBoard, board, (objValue, srcValue) => {
                    if (_.isArray(objValue)) {
                        return objValue.concat(srcValue);
                    }
                });
            }

            const board: RawBoard = {
                ...mergedBoard,
                threads: _.uniqBy(mergedBoard.threads, "id").map(thread => {
                    return {
                        ...thread,
                        openingPost: {
                            ...thread.openingPost,
                            attachments: _.uniqBy(thread.openingPost.attachments, "id"),
                        },
                        replies: _.uniqBy(thread.replies, "id").map(reply => {
                            return {
                                ...reply,
                                attachments: _.uniqBy(reply.attachments, "id"),
                            };
                        }),
                    };
                }),
            };

            results.push(board);
        }

        return results;
    }

    public async write(boards: RawBoard[]) {
        boards = this.mergeBoards(boards);

        return this.logger.doWork({
            level: "log",
            message: `Writing crawled data into database`,
            work: async () => {
                const threads = boards.flatMap(board => board.threads);
                const posts = threads.flatMap(thread => [thread.openingPost, ...thread.replies]);
                const oldPosts = await this.postService.getIdMap(posts.map(post => post.id));
                const newPosts: RawPost[] = [];
                for (const post of posts) {
                    const oldPost = oldPosts[post.id];
                    if (isEqual(oldPost, post)) {
                        continue;
                    }

                    newPosts.push(post);
                }

                const attachments = newPosts.flatMap(post => post.attachments);
                const newThreads: RawThread[] = [];
                for (const thread of threads) {
                    if (!oldPosts[thread.openingPost.id]) {
                        newThreads.push(thread);
                        continue;
                    }

                    const replyIds = thread.replies.map(reply => reply.id);
                    if (replyIds.some(replyId => !oldPosts[replyId])) {
                        newThreads.push(thread);
                    }
                }

                const savedAttachments = await this.attachmentService.save(attachments);
                await this.postService.save(newPosts);
                await this.threadService.save(newThreads);

                const boardMap = await this.boardService.getIdMap(_.map(boards, "id"));
                const threadMap = await this.threadService.getIdMap();
                const newBoards: RawBoard[] = [];

                for (const board of boards) {
                    const oldBoard = boardMap[board.id];
                    if (!oldBoard) {
                        newBoards.push(board);
                        continue;
                    }

                    if (_.difference(oldBoard.threadIds, _.map(board.threads, "id")).length !== 0) {
                        newBoards.push({
                            ...board,
                            threads: _.chain(oldBoard.threadIds)
                                .map<RawThread>(threadId => threadMap[threadId])
                                .concat(board.threads)
                                .compact()
                                .uniqBy("id")
                                .value(),
                        });
                    }
                }

                await this.boardService.save(newBoards);

                const updatedItems = [
                    `${attachments.length} attachments`,
                    `${newPosts.length} posts`,
                    `${newThreads.length} threads`,
                    `${newBoards.length} boards`,
                ]
                    .filter(p => p[0] !== "0")
                    .join(", ");

                if (updatedItems.length === 0) {
                    this.logger.log(`There was nothing to write.`);
                } else {
                    this.logger.log(`Successfully wrote {cyan} into database.`, undefined, updatedItems);
                }

                return {
                    attachments: savedAttachments,
                    posts: newPosts,
                    threads: newThreads,
                    boards: newBoards,
                };
            },
        });
    }
}
