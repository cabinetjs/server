import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PostService } from "@post/post.service";

import { Post } from "@post/models/post.model";

@Module({
    imports: [TypeOrmModule.forFeature([Post])],
    providers: [PostService],
    exports: [PostService],
})
export class PostModule {}
