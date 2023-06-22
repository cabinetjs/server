import path from "path";
import { ResolveField, Resolver, Root } from "@nestjs/graphql";

import { Thumbnail } from "@thumbnail/models/thumbnail.model";

import { Config } from "@config/config.module";
import { InjectConfig } from "@config/config.decorator";

@Resolver(() => Thumbnail)
export class ThumbnailResolver {
    private readonly thumbnailPath: string;

    public constructor(@InjectConfig() private readonly config: Config) {
        let thumbnailPath = config.thumbnailPath || "./thumbnails";
        if (!path.isAbsolute(thumbnailPath)) {
            thumbnailPath = path.join(process.cwd(), thumbnailPath);
        }

        this.thumbnailPath = thumbnailPath;
    }

    @ResolveField(() => String)
    public async url(@Root() root: Thumbnail) {
        const imagePath = path.relative(this.thumbnailPath, root.path);
        return `/thumbnails/${imagePath}`;
    }
}
