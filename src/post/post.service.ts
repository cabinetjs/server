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

    public async findOpeningByIds(ids: ReadonlyArray<Post["uri"]>): Promise<Array<Post | null>> {
        const posts = await this.findByIds(ids);

        return posts.map(post => (post.parent ? null : post));
    }

    public async getReplyIdsOf(post: Post) {
        return this.repository
            .createQueryBuilder("p")
            .select("`p`.`id`", "id")
            .where("`p`.`parent` = :id", { id: post.uri })
            .getRawMany<{ id: Post["uri"] }>()
            .then(raw => raw.map(({ id }) => id));
    }
}
