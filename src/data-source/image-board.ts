import { BaseDataSource, BaseDataSourceOption } from "@data-source/base";
import { BoardAPIResponse, CatalogAPIResponse, ThreadsAPIResponse } from "@data-source/image-board.types";

import { MinimalBoard } from "@database/models/board.model";

import { Fetcher } from "@utils/fetcher";
import _ from "lodash";

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
    protected async doCrawl(): Promise<MinimalBoard[]> {
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

        const boardArticles = _.chain(matchedThreads)
            .groupBy(thread => thread.boardCode)
            .value();

        const results: MinimalBoard[] = [];
        for (const [boardCode, articles] of Object.entries(boardArticles)) {
            const targetBoard = this.targetBoards.find(board => board.board === boardCode);
            if (!targetBoard) {
                throw new Error(`Failed to find board with code '${boardCode}'`);
            }

            const board: MinimalBoard = {
                uid: boardCode,
                name: targetBoard.title,
                description: targetBoard.meta_description,
                articles: [],
            };

            for (const article of articles) {
                const result = await this.fetcher
                    .fetchJson("/{board}/thread/{thread}.json", {
                        method: "GET",
                        params: { board: boardCode, thread: article.no },
                    })
                    .then(({ posts }) => {
                        return posts.filter(post => post.resto !== 0);
                    });

                board.articles.push({
                    no: article.no,
                    title: article.sub,
                    content: article.com,
                    comments: result.map(comment => ({
                        no: comment.no,
                        content: comment.com,
                    })),
                });
            }

            results.push(board);
        }

        return results;
    }
}
