import { LessThanOrEqual } from "typeorm";
import dayjs from "dayjs";

import { Inject, Injectable } from "@nestjs/common";

import { DataSourceService } from "@data-source/data-source.service";
import { BoardService } from "@board/board.service";
import { PostService } from "@post/post.service";
import { AttachmentService } from "@attachment/attachment.service";
import { CrawlerService } from "@crawler/crawler.service";

import { Statistic } from "@statistic/models/statistic.model";

import { Nullable } from "@utils/types";
import { TimeSpanUnit } from "@statistic/statistic.resolver";

@Injectable()
export class StatisticService {
    public constructor(
        @Inject(DataSourceService) private readonly dataSourceService: DataSourceService,
        @Inject(BoardService) private readonly boardService: BoardService,
        @Inject(PostService) private readonly postService: PostService,
        @Inject(AttachmentService) private readonly attachmentService: AttachmentService,
        @Inject(CrawlerService) private readonly crawlerService: CrawlerService,
    ) {}

    public async getStatistic(
        endDate: Nullable<Date>,
        timeSpanValue: number,
        timeSpanUnit: TimeSpanUnit,
    ): Promise<Statistic> {
        endDate ??= new Date();

        const startDate = dayjs(endDate).subtract(timeSpanValue, timeSpanUnit).toDate();
        const condition = LessThanOrEqual(endDate);
        const oldCondition = LessThanOrEqual(startDate);

        const oldBoardCount = await this.boardService.count({ createdAt: oldCondition });
        const oldPostCount = await this.postService.count({ createdAt: oldCondition });
        const oldAttachmentCount = await this.attachmentService.count({ createdAt: oldCondition });

        const boardCount = await this.boardService.count({ createdAt: condition });
        const postCount = await this.postService.count({ createdAt: condition });
        const attachmentCount = await this.attachmentService.count({ createdAt: condition });

        const statistic = new Statistic();
        statistic.boardCount = boardCount;
        statistic.postCount = postCount;
        statistic.attachmentCount = attachmentCount;
        statistic.fileSize = await this.attachmentService.getFileSize(null, endDate);
        statistic.oldBoardCount = oldBoardCount;
        statistic.oldPostCount = oldPostCount;
        statistic.oldAttachmentCount = oldAttachmentCount;
        statistic.oldFileSize = await this.attachmentService.getFileSize(null, startDate);
        statistic.lastCrawlingLog = await this.crawlerService.getLastLog(true);

        return statistic;
    }
}
