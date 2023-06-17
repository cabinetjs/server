import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PostService } from "@post/post.service";
import { PostResolver } from "@post/post.resolver";
import { Post } from "@post/models/post.model";

import { AttachmentModule } from "@attachment/attachment.module";

@Module({
    imports: [TypeOrmModule.forFeature([Post]), AttachmentModule],
    providers: [PostService, PostResolver],
    exports: [PostService],
})
export class PostModule {}
