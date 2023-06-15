import { BoardAPIResponse, CatalogAPIResponse, ThreadsAPIResponse } from "@data-source/types/image-board.types";
import { BaseDataSource, BaseDataSourceOption } from "@data-source/types/base";

import { RawBoard } from "@board/models/board.model";

import { Fetcher } from "@utils/fetcher";

export interface ImageBoardFilter {
    title?: string;
    content?: string;
    caseSensitive?: boolean;
}

export interface ImageBoardDataSourceOptions extends BaseDataSourceOption<"ImageBoard"> {
    url: string;
    boards: string[];
    filters?: ImageBoardFilter[];
}

interface FetcherResponseMap {
    "/boards.json": BoardAPIResponse.Root;
    "/{board}/catalog.json": CatalogAPIResponse.Root;
    "/{board}/thread/{thread}.json": ThreadsAPIResponse.Root;
}

type OpThreadPair = [string, CatalogAPIResponse.Thread];

export class ImageBoardDataSource extends BaseDataSource<"ImageBoard", ImageBoardDataSourceOptions> {
    private readonly fetcher = new Fetcher<FetcherResponseMap>(this.options.url);
    private readonly targetBoards: BoardAPIResponse.Board[] = [];

    public constructor(options: ImageBoardDataSourceOptions) {
        super("ImageBoard", options);
    }

    protected async doInitialize(): Promise<void> {
        const { boards } = this.options;
        const data = await this.fetcher.fetchJson("/boards.json");
        for (const boardCode of boards) {
            const board = data.boards.find(board => board.board === boardCode);
            if (!board) {
                throw new Error(`Failed to find board with code '${boardCode}'`);
            }

            this.targetBoards.push(board);
        }
    }
    protected async doCrawl(): Promise<RawBoard[]> {
        const { boards, filters = [] } = this.options;
        const allOpeningThreads: OpThreadPair[] = [];
        for (const boardCode of boards) {
            const pages = await this.fetcher.fetchJson("/{board}/catalog.json", {
                params: { board: boardCode },
            });

            for (const { threads } of pages) {
                allOpeningThreads.push(...threads.map<OpThreadPair>(thread => [boardCode, thread]));
            }
        }

        const matchedThreads: OpThreadPair[] = [];
        for (const [board, thread] of allOpeningThreads) {
            if (!filters.length) {
                break;
            }

            for (const { title, content, caseSensitive = false } of filters) {
                const titleMatched = title
                    ? caseSensitive
                        ? !!thread.sub && thread.sub.includes(title)
                        : !!thread.sub && thread.sub.toLowerCase().includes(title.toLowerCase())
                    : true;
                const contentMatched = content
                    ? caseSensitive
                        ? !!thread.com && thread.com.includes(content)
                        : !!thread.com && thread.com.toLowerCase().includes(content.toLowerCase())
                    : true;

                if (titleMatched && contentMatched) {
                    matchedThreads.push([board, thread]);
                    break;
                }
            }
        }

        const results: RawBoard[] = [];
        for (const [boardCode, { no: opPostId }] of matchedThreads) {
            const targetBoard = this.targetBoards.find(board => board.board === boardCode);
            if (!targetBoard) {
                throw new Error(`Failed to find board with code '${boardCode}'`);
            }

            let board = results.find(board => board.code === boardCode);
            if (!board) {
                board = {
                    code: targetBoard.board,
                    name: targetBoard.title,
                    description: targetBoard.meta_description,

                    threads: [],
                };

                results.push(board);
            }

            const { posts } = await this.fetcher.fetchJson("/{board}/thread/{thread}.json", {
                params: { board: boardCode, thread: opPostId },
            });

            const opPost = posts.find(post => post.no === opPostId);
            if (!opPost) {
                throw new Error(`Failed to find op post with id '${opPostId}'`);
            }

            board.threads.push({
                openingPost: {
                    no: opPost.no,
                    title: opPost.sub,
                    content: opPost.com,
                },
                replies: posts
                    .filter(post => post.no !== opPostId)
                    .map(reply => ({
                        no: reply.no,
                        title: reply.sub,
                        content: reply.com,
                    })),
            });
        }

        return results;
    }
}
