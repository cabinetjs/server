import dayjs from "dayjs";
import _ from "lodash";
import { decode } from "html-entities";
import mime from "mime-types";

import { BoardAPIResponse, CatalogAPIResponse, ThreadsAPIResponse } from "@data-source/types/image-board.types";
import { BaseDataSource, BaseDataSourceOption } from "@data-source/types/base";

import { RawBoard } from "@board/models/board.model";

import { Fetcher } from "@utils/fetcher";
import { RawAttachment } from "@attachment/models/attachment.model";
import { RawPost } from "@post/models/post.model";

export interface ImageBoardFilter {
    title?: string;
    content?: string;
    caseSensitive?: boolean;
}

export interface ImageBoardDataSourceOptions extends BaseDataSourceOption<"image-board"> {
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

export class ImageBoardDataSource extends BaseDataSource<"image-board", ImageBoardDataSourceOptions> {
    private readonly fetcher = new Fetcher<FetcherResponseMap>(this.options.url);
    private readonly targetBoards: BoardAPIResponse.Board[] = [];

    public constructor(options: ImageBoardDataSourceOptions) {
        super("image-board", options);
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
                    uri: `${this.name}::${boardCode}`,
                    code: targetBoard.board,
                    name: targetBoard.title,
                    description: decode(targetBoard.meta_description),
                    posts: [],
                };

                results.push(board);
            }

            const {
                posts: [rawOpPost, ...rawReplies],
            } = await this.fetcher.fetchJson("/{board}/thread/{thread}.json", {
                params: { board: boardCode, thread: opPostId },
            });

            const parentBoard = board;
            const opPost = this.buildPost(boardCode, parentBoard, rawOpPost);
            const replies = rawReplies.map(rawReply => this.buildPost(boardCode, parentBoard, rawReply, opPost));

            parentBoard.posts ??= [];
            parentBoard.posts.push(opPost, ...replies);
        }

        return results;
    }

    private buildPost(
        boardCode: string,
        board: RawBoard,
        rawPost: ThreadsAPIResponse.Post,
        parent?: RawPost,
    ): RawBoard["posts"][0] {
        const uri = `${board.uri}::${rawPost.no}`;

        return {
            uri,
            parent: parent?.uri,
            no: rawPost.no,
            title: rawPost.sub ? decode(rawPost.sub) : null,
            content: rawPost.com ? decode(rawPost.com) : null,
            attachments: _.compact([this.getAttachment(boardCode, rawPost, uri)]),
            writtenAt: dayjs.unix(rawPost.time).toDate(),
        };
    }

    private getAttachment(boardCode: string, post: ThreadsAPIResponse.Post, postUri: string): RawAttachment | null {
        if (!("tim" in post)) {
            return null;
        }

        return {
            uri: `${postUri}::${post.tim}`,
            uid: post.tim.toString(),
            url: `https://i.4cdn.org/${boardCode}/${post.tim}${post.ext}`,
            size: post.fsize,
            name: post.filename,
            extension: post.ext,
            hash: post.md5,
            mimeType: mime.lookup(post.ext) || null,
        };
    }
}
