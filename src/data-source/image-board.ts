import { BaseDataSource, BaseDataSourceOption } from "@data-source/base";
import { BoardAPIResponse, CatalogAPIResponse, ThreadsAPIResponse } from "@data-source/image-board.types";

import { Fetcher } from "@utils/fetcher";
import { Article } from "@utils/types";

export interface ImageBoardFilter {
    title?: string;
    content?: string;
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

type RawThread = CatalogAPIResponse.Thread & { boardCode: string };

export class ImageBoardDataSource extends BaseDataSource<"ImageBoard", ImageBoardDataSourceOptions> {
    private readonly fetcher = new Fetcher<FetcherResponseMap>(this.options.url);

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
        }

        return;
    }
    protected async doCrawl(): Promise<Article[]> {
        const { boards, filters } = this.options;
        const allOpeningThreads: RawThread[] = [];
        for (const boardCode of boards) {
            const pages = await this.fetcher.fetchJson("/{board}/catalog.json", {
                method: "GET",
                params: { board: boardCode },
            });

            for (const { threads } of pages) {
                allOpeningThreads.push(
                    ...threads.map(thread => ({
                        ...thread,
                        boardCode,
                    })),
                );
            }
        }

        const matchedThreads: RawThread[] = [];
        for (const thread of allOpeningThreads) {
            const { sub, com } = thread;
            if (!filters) {
                matchedThreads.push(thread);
                continue;
            }

            for (const { title, content } of filters) {
                const titleRegex = title ? new RegExp(title) : undefined;
                const contentRegex = content ? new RegExp(content) : undefined;
                const titleMatched = titleRegex ? !!sub && titleRegex.test(sub) : true;
                const contentMatched = contentRegex ? !!com && contentRegex.test(com) : true;

                if (titleMatched && contentMatched) {
                    matchedThreads.push(thread);
                    break;
                }
            }
        }

        const commentMap: Record<number, ThreadsAPIResponse.Post[]> = {};
        for (const { no, boardCode } of matchedThreads) {
            const result = await this.fetcher.fetchJson("/{board}/thread/{thread}.json", {
                method: "GET",
                params: {
                    thread: no,
                    board: boardCode,
                },
            });

            commentMap[no] = result.posts.filter(post => post.resto !== 0);
        }

        return matchedThreads.map(thread => ({
            id: thread.no,
            title: thread.sub,
            content: thread.com,
            comments: commentMap[thread.no].map(comment => ({
                id: comment.no,
                content: comment.com,
            })),
        }));
    }
}
