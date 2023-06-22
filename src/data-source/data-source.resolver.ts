import { IsNull, Like } from "typeorm";

import { Inject } from "@nestjs/common";
import { Args, Int, Query, ResolveField, Resolver, Root } from "@nestjs/graphql";

import { DataSourceService } from "@data-source/data-source.service";
import { BoardService } from "@board/board.service";
import { PostService } from "@post/post.service";
import { AttachmentService } from "@attachment/attachment.service";

import { DataSourceModel } from "@data-source/models/data-source.model";
import { Attachment } from "@attachment/models/attachment.model";
import { Board } from "@board/models/board.model";
import { Post } from "@post/models/post.model";

@Resolver(() => DataSourceModel)
export class DataSourceResolver {
    public constructor(
        @Inject(DataSourceService) private readonly dataSourceService: DataSourceService,
        @Inject(BoardService) private readonly boardService: BoardService,
        @Inject(PostService) private readonly postService: PostService,
        @Inject(AttachmentService) private readonly attachmentService: AttachmentService,
    ) {}

    @Query(() => DataSourceModel, { nullable: true })
    public async dataSource(@Args("name", { type: () => String }) name: string): Promise<DataSourceModel | null> {
        const dataSources = this.dataSourceService.getRegisteredDataSources();

        return dataSources.find(dataSource => dataSource.id === name) ?? null;
    }

    @Query(() => [DataSourceModel])
    public async dataSources(): Promise<DataSourceModel[]> {
        return this.dataSourceService.getRegisteredDataSources();
    }

    @Query(() => Int)
    public async dataSourceCount(): Promise<number> {
        return this.dataSourceService.getRegisteredDataSources().length;
    }

    @ResolveField(() => Int)
    public async postCount(@Root() dataSource: DataSourceModel) {
        return this.dataSourceService.getPostCount(dataSource.id);
    }

    @ResolveField(() => Int)
    public async mediaCount(@Root() dataSource: DataSourceModel) {
        return this.dataSourceService.getMediaCount(dataSource.id);
    }

    @ResolveField(() => Int)
    public async boardCount(@Root() dataSource: DataSourceModel) {
        return this.boardService.count({ uri: Like(`${dataSource.id}::%`) });
    }

    @ResolveField(() => Attachment, { nullable: true })
    public async latestAttachment(@Root() dataSource: DataSourceModel) {
        return this.dataSourceService.getLatestMedia(dataSource.id);
    }

    @ResolveField(() => [Board])
    public async boards(@Root() dataSource: DataSourceModel) {
        return this.boardService.find({
            where: {
                uri: Like(`${dataSource.id}::%`),
            },
        });
    }

    @ResolveField(() => [Post])
    public async openingPosts(@Root() dataSource: DataSourceModel) {
        return this.postService.find({
            where: {
                uri: Like(`${dataSource.id}::%`),
                parent: IsNull(),
            },
            order: { writtenAt: "DESC" },
        });
    }

    @ResolveField(() => [Attachment])
    public async attachments(@Root() dataSource: DataSourceModel) {
        return this.attachmentService.find({
            where: {
                uri: Like(`${dataSource.id}::%`),
            },
        });
    }
}
