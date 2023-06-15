import { Repository } from "typeorm";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Post, RawPost } from "@post/models/post.model";

import { BaseService } from "@common/base.service";

@Injectable()
export class PostService extends BaseService<Post, RawPost> {
    public constructor(@InjectRepository(Post) postRepository: Repository<Post>) {
        super(Post, postRepository);
    }
}
