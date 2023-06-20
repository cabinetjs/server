import { IsNull, Like, Not, Repository } from "typeorm";

import { InjectRepository } from "@nestjs/typeorm";
import { Inject, Injectable } from "@nestjs/common";

import { Board, RawBoard } from "@board/models/board.model";

import { BaseService } from "@common/base.service";
import { PostService } from "@post/post.service";
import { AttachmentService } from "@attachment/attachment.service";

@Injectable()
export class BoardService extends BaseService<Board, RawBoard> {
    public constructor(
        @InjectRepository(Board) boardRepository: Repository<Board>,
        @Inject(PostService) private readonly postService: PostService,
        @Inject(AttachmentService) private readonly attachmentService: AttachmentService,
    ) {
        super(Board, boardRepository);
    }

    public async getPostCount(uri: string) {
        return this.postService.count({ uri: Like(`${uri}::%`) });
    }
    public async getMediaCount(uri: string) {
        return this.attachmentService.count({ uri: Like(`${uri}::%`) });
    }
    public async getLatestMedia(uri: string) {
        return this.attachmentService.findOne({
            where: {
                uri: Like(`${uri}::%`),
                isStored: true,
                storedAt: Not(IsNull()),
            },
            order: {
                createdAt: "DESC",
                storedAt: "DESC",
            },
        });
    }
}
