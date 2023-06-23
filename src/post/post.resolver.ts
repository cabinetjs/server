import { Inject } from "@nestjs/common";
import { Context, Int, ResolveField, Resolver, Root } from "@nestjs/graphql";

import { PostService } from "@post/post.service";
import { Post } from "@post/models/post.model";
import { Attachment } from "@attachment/models/attachment.model";

import { createBaseResolver } from "@common/base.resolver";

import { GraphQLContext } from "@utils/graphql";

@Resolver(() => Post)
export class PostResolver extends createBaseResolver(Post) {
    public constructor(@Inject(PostService) private readonly postService: PostService) {
        super(postService);
    }

    @ResolveField(() => [Post])
    public async replies(@Root() post: Post, @Context("loaders") loaders: GraphQLContext["loaders"]) {
        const replyIds = await this.postService.getReplyIdsOf(post);

        return loaders.post.loadMany(replyIds);
    }

    @ResolveField(() => Post, { nullable: true })
    public async lastReply(@Root() post: Post, @Context("loaders") loaders: GraphQLContext["loaders"]) {
        const replyIds = await this.postService.getReplyIdsOf(post, ["writtenAt", "DESC"]);

        return loaders.post.load(replyIds[0]);
    }

    @ResolveField(() => Int)
    public async replyCount(@Root() post: Post, @Context("loaders") loaders: GraphQLContext["loaders"]) {
        return loaders.postReplyCount.load(post.uri);
    }

    @ResolveField(() => Int)
    public async attachmentCount(@Root() post: Post, @Context("loaders") loaders: GraphQLContext["loaders"]) {
        return loaders.postAttachmentCount.load(post.uri);
    }

    @ResolveField(() => [Attachment])
    public async attachments(@Root() post: Post, @Context("loaders") loaders: GraphQLContext["loaders"]) {
        return loaders.attachmentOfPost.load(post.id);
    }
}
