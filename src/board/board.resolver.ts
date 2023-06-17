import _ from "lodash";

import { Inject } from "@nestjs/common";
import { Context, ResolveField, Resolver, Root } from "@nestjs/graphql";

import { BoardService } from "@board/board.service";
import { Board } from "@board/models/board.model";

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
}
