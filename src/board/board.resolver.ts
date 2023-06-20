import _ from "lodash";

import { Inject } from "@nestjs/common";
import { Context, Int, ResolveField, Resolver, Root } from "@nestjs/graphql";

import { BoardService } from "@board/board.service";

import { Board } from "@board/models/board.model";
import { Attachment } from "@attachment/models/attachment.model";
import { Post } from "@post/models/post.model";

import { createBaseResolver } from "@common/base.resolver";

import { GraphQLContext } from "@utils/graphql";

@Resolver(() => Board)
export class BoardResolver extends createBaseResolver(Board) {
    public constructor(@Inject(BoardService) private readonly boardService: BoardService) {
        super(boardService);
    }

    @ResolveField(() => [Post])
    public async openingPosts(@Root() board: Board, @Context("loaders") loaders: GraphQLContext["loaders"]) {
        return loaders.openingPost.loadMany(board.postIds).then(posts => _.compact(posts));
    }

    @ResolveField(() => [Post])
    public async posts(@Root() board: Board, @Context("loaders") loaders: GraphQLContext["loaders"]) {
        return loaders.post.loadMany(board.postIds);
    }

    @ResolveField(() => Int)
    public async postCount(@Root() board: Board) {
        return this.boardService.getPostCount(board.uri);
    }

    @ResolveField(() => Int)
    public async mediaCount(@Root() board: Board) {
        return this.boardService.getMediaCount(board.uri);
    }

    @ResolveField(() => Attachment, { nullable: true })
    public async latestAttachment(@Root() board: Board) {
        return this.boardService.getLatestMedia(board.uri);
    }
}
