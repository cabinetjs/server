import { LessThanOrEqual } from "typeorm";
import dayjs, { ManipulateType } from "dayjs";

import { Inject, Injectable } from "@nestjs/common";

import { TimeRange, TimeSpanUnit } from "@statistic/statistic.resolver";

import { DataSourceService } from "@data-source/data-source.service";
import { BoardService } from "@board/board.service";
import { PostService } from "@post/post.service";
import { AttachmentService } from "@attachment/attachment.service";
import { CrawlerService } from "@crawler/crawler.service";

import { Statistic } from "@statistic/models/statistic.model";
import { AttachmentStatus } from "@statistic/models/attachment-status.model";

import { Nullable } from "@utils/types";

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

    public async getAttachmentStatus(date: Nullable<Date>, range: TimeRange) {
        date ??= new Date();
        let timeDelta: [number, ManipulateType];

        switch (range) {
            case TimeRange.HalfHour:
                date = dayjs(date).subtract(30, "minute").toDate();
                timeDelta = [5, "minute"];
                break;

            case TimeRange.Hour:
                date = dayjs(date).subtract(1, "hour").toDate();
                timeDelta = [10, "minute"];
                break;

            case TimeRange.Day:
                date = dayjs(date).subtract(1, "day").toDate();
                timeDelta = [2, "hour"];
                break;

            case TimeRange.Week:
                date = dayjs(date).subtract(1, "week").toDate();
                timeDelta = [1, "day"];
                break;

            case TimeRange.Month:
                date = dayjs(date).subtract(1, "month").toDate();
                timeDelta = [5, "day"];
                break;

            case TimeRange.Year:
                date = dayjs(date).subtract(1, "year").toDate();
                timeDelta = [1, "month"];
                break;

            default:
                throw new Error("Invalid time range");
        }

        const result: AttachmentStatus[] = [];
        let currentDate = dayjs(date);
        while (true) {
            const endDate = currentDate.clone().add(timeDelta[0], timeDelta[1]);
            if (endDate.isAfter(dayjs())) {
                break;
            }

            const endDateValue = endDate.toDate();
            const status = new AttachmentStatus();
            status.fileSize = 0;
            try {
                status.fileSize = await this.attachmentService.getFileSize(null, endDateValue);
            } catch {}

            status.count = await this.attachmentService.count({
                createdAt: LessThanOrEqual(endDateValue),
            });

            const previousItem = result.at(-1);
            if (previousItem) {
                status.countDelta = status.count - previousItem.count;
                status.fileSizeDelta = status.fileSize - previousItem.fileSize;
            } else {
                const currentDateValue = currentDate.toDate();
                const previousCount = await this.attachmentService.count({
                    createdAt: LessThanOrEqual(currentDateValue),
                });

                status.countDelta = status.count - previousCount;

                try {
                    const previousFileSize = await this.attachmentService.getFileSize(null, currentDateValue);
                    status.fileSizeDelta = status.fileSize - previousFileSize;
                } catch {
                    status.fileSizeDelta = status.fileSize;
                }
            }

            result.push(status);
            currentDate = endDate.clone();
        }

        return result;
    }
}
