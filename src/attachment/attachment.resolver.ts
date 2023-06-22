import { Inject } from "@nestjs/common";
import { Args, Context, Int, ResolveField, Resolver, Root } from "@nestjs/graphql";

import { ThumbnailService } from "@thumbnail/thumbnail.service";
import { Thumbnail } from "@thumbnail/models/thumbnail.model";
import { Attachment } from "@attachment/models/attachment.model";

import { GraphQLContext } from "@utils/graphql";

@Resolver(() => Attachment)
export class AttachmentResolver {
    public constructor(@Inject(ThumbnailService) private readonly thumbnailService: ThumbnailService) {}

    @ResolveField(() => Thumbnail)
    public async sizedThumbnail(
        @Root() root: Attachment,
        @Args("size", { type: () => Int }) size: number,
        @Context("loaders") loaders: GraphQLContext["loaders"],
    ): Promise<Thumbnail> {
        return loaders.thumbnail.load([root.id, { size }]);
    }
}
