import _ from "lodash";

import { Repository } from "typeorm";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Post, RawPost } from "@post/models/post.model";

import { BaseService } from "@common/base.service";
import { Nullable } from "@utils/types";

@Injectable()
export class PostService extends BaseService<Post, RawPost> {
    public constructor(@InjectRepository(Post) postRepository: Repository<Post>) {
        super(Post, postRepository);
    }

    public async findOpeningByIds(ids: ReadonlyArray<Post["uri"]>): Promise<Array<Post | null>> {
        const posts = await this.findByIds(ids);

        return posts.map(post => (post.parent ? null : post));
    }

    public async getReplyIdsOf(post: Post, order?: [keyof Post, "ASC" | "DESC"]) {
        let repository = this.repository
            .createQueryBuilder("p")
            .select("`p`.`id`", "id")
            .where("`p`.`parent` = :id", { id: post.uri });

        if (order) {
            repository = repository.orderBy(`\`p\`.\`${order[0]}\``, order[1]);
        }

        return repository.getRawMany<{ id: Post["uri"] }>().then(raw => raw.map(({ id }) => id));
    }

    public async getReplyCounts(uris: ReadonlyArray<Post["id"]>): Promise<number[]> {
        const rows = await this.repository
            .createQueryBuilder("p")
            .select("`p`.`id`", "id")
            .addSelect("`p`.`parent`", "parent")
            .addSelect("COUNT(`p`.`id`)", "count")
            .where("`p`.`parent` IN (:...uris)", { uris })
            .groupBy("`p`.`parent`")
            .getRawMany<{ parent: Post["uri"]; count: string }>();

        const countMap = _.chain(rows).keyBy("parent").mapValues("count").value();

        return uris.map(uri => parseInt(`${countMap[uri] ?? 0}`, 10));
    }

    public async getAttachmentCounts(uris: ReadonlyArray<Post["id"]>): Promise<number[]> {
        const rows = await this.repository
            .createQueryBuilder("p")
            .select("`p`.`uri`", "uri")
            .addSelect("`p`.`parent`", "parent")
            .addSelect("`a`.`id`", "attachmentId")
            .leftJoin("attachments", "a", "`p`.`id` = `a`.`postId`")
            .where("`p`.`parent` IN (:...uris)", { uris })
            .orWhere("`p`.`uri` IN (:...uris)", { uris })
            .getRawMany<{ uri: string; parent: Nullable<string>; attachmentId: Nullable<string> }>();

        const countMap: Record<string, number> = {};
        for (const { uri, parent, attachmentId } of rows) {
            const key = parent ?? uri;
            countMap[key] = (countMap[key] ?? 0) + (attachmentId ? 1 : 0);
        }

        return uris.map(uri => countMap[uri] ?? 0);
    }
}
