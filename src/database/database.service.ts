import _ from "lodash";
import { Like } from "typeorm";

import { Inject, Injectable } from "@nestjs/common";

import { AttachmentService } from "@attachment/attachment.service";
import { Attachment, RawAttachment } from "@attachment/models/attachment.model";

import { PostService } from "@post/post.service";
import { Post, RawPost } from "@post/models/post.model";

import { BoardService } from "@board/board.service";
import { Board, RawBoard } from "@board/models/board.model";

import { Logger } from "@utils/logger";

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
        const newAttachments = _.chain(boards).map("posts").flatten().map("attachments").flatten().value();
        const oldAttachments = await this.attachmentService.find({
            where: boards.map(board => ({ uri: Like(`${board.uri}::%`) })),
        });

        const { addedAttachments, updatedAttachments } = this.mergeAttachments(oldAttachments, newAttachments);
        let allAttachments = [...addedAttachments, ...updatedAttachments];
        allAttachments = await this.attachmentService.save(allAttachments);

        const attachmentMap = _.keyBy(allAttachments, "uri");
        const allPosts: Post[] = [];
        const allBoards: Board[] = [];
        for (const board of boards) {
            let targetBoard = await this.boardService.findOne({ where: { uri: board.uri } });
            if (!targetBoard) {
                targetBoard = this.boardService.create(board);
                targetBoard.posts = [];

                targetBoard = await this.boardService.save(targetBoard);
            }

            allBoards.push(targetBoard);

            const oldPosts = await this.postService.find({ where: { uri: Like(`${board.uri}::%`) } });
            const { updatedPosts, addedPosts } = this.mergePosts(oldPosts, board.posts, attachmentMap);
            const targetPosts = [...addedPosts, ...updatedPosts];
            for (const post of targetPosts) {
                post.board = targetBoard;
                post.attachments = [
                    ...(post.attachments ?? []),
                    ...allAttachments.filter(a => a.uri.startsWith(post.uri)),
                ];
            }

            const savedPosts = await this.postService.save(targetPosts);
            allPosts.push(...savedPosts);
        }

        return {
            attachments: allAttachments,
            posts: allPosts,
            boards: allBoards,
        };
    }

    private mergeAttachments(oldAttachments: Attachment[], newAttachments: RawAttachment[]) {
        const newAttachmentMap = _.keyBy(newAttachments, "uri");
        const oldAttachmentMap = _.keyBy(oldAttachments, "uri");

        const targets = [...oldAttachments, ..._.differenceBy(newAttachments, oldAttachments, "uri")];
        const updatedAttachments: Attachment[] = [];
        const addedAttachments: Attachment[] = [];
        for (const target of targets) {
            const oldAttachment = oldAttachmentMap[target.uri];
            const newAttachment = newAttachmentMap[target.uri];
            if (!oldAttachment && !newAttachment) {
                continue;
            }

            if (!oldAttachment) {
                addedAttachments.push(this.attachmentService.create(newAttachment));
                continue;
            }

            if (!newAttachment || Attachment.compare(oldAttachment, newAttachment)) {
                continue;
            }

            const attachment = this.mergeAttachment(oldAttachment, newAttachment);
            updatedAttachments.push(attachment);
        }

        return {
            updatedAttachments,
            addedAttachments,
        };
    }
    private mergeAttachment(oldAttachment: Attachment, newAttachment: RawAttachment) {
        if (oldAttachment.uri !== newAttachment.uri) {
            throw new Error(`Attachment uri mismatch: ${oldAttachment.uri} !== ${newAttachment.uri}`);
        }

        const result = this.attachmentService.create(oldAttachment);
        result.uid = newAttachment.uid;
        result.url = newAttachment.url;
        result.thumbnailUrl = newAttachment.thumbnailUrl;
        result.size = newAttachment.size;
        result.name = newAttachment.name;
        result.extension = newAttachment.extension;
        result.hash = newAttachment.hash;
        result.mimeType = newAttachment.mimeType;

        return result;
    }

    private mergePosts(oldPosts: Post[], newPosts: RawPost[], attachmentMap: _.Dictionary<Attachment>) {
        const newPostMap = _.keyBy(newPosts, "uri");
        const oldPostMap = _.keyBy(oldPosts, "uri");

        const targets = [...oldPosts, ..._.differenceBy(newPosts, oldPosts, "uri")];
        const updatedPosts: Post[] = [];
        const addedPosts: Post[] = [];
        for (const target of targets) {
            const oldPost = oldPostMap[target.uri];
            const newPost = newPostMap[target.uri];
            if (!oldPost && !newPost) {
                continue;
            }

            if (!oldPost) {
                const post = this.postService.create(newPost);
                post.attachments = _.chain(newPost.attachments)
                    .map("uri")
                    .map(uri => attachmentMap[uri])
                    .value();

                addedPosts.push(post);
                continue;
            }

            if (!newPost || Post.compare(oldPost, newPost)) {
                continue;
            }

            const post = this.mergePost(oldPost, newPost, attachmentMap);
            updatedPosts.push(post);
        }

        return {
            updatedPosts,
            addedPosts,
        };
    }
    private mergePost(oldPost: Post, newPost: RawPost, attachmentMap: _.Dictionary<Attachment>) {
        if (oldPost.uri !== newPost.uri) {
            throw new Error(`Post uri mismatch: ${oldPost.uri} !== ${newPost.uri}`);
        }

        const result = this.postService.create(oldPost);
        result.title = newPost.title;
        result.content = newPost.content;
        result.no = newPost.no;
        result.parent = newPost.parent;
        result.attachments = _.chain(attachmentMap)
            .entries()
            .filter(([uri]) => uri.startsWith(newPost.uri))
            .map(([, attachment]) => attachment)
            .value();

        return result;
    }
}
