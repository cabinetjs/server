import ms from "ms";
import { CronJob, Job, SimpleIntervalJob, Task, ToadScheduler } from "toad-scheduler";

import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

import { DatabaseService } from "@database/database.service";
import { DataSourceService } from "@data-source/data-source.service";

import { AttachmentCreatedEvent } from "@attachment/events/attachment-created.event";

import { Config } from "@config/config.module";
import { InjectConfig } from "@config/config.decorator";

import { RawBoard } from "@board/models/board.model";

import { formatInterval, isCronExpression } from "@utils/date";
import { Logger } from "@utils/logger";
import pluralize from "pluralize";

@Injectable()
export class CrawlerService implements OnModuleInit {
    private readonly logger = new Logger(CrawlerService.name);
    private readonly scheduler = new ToadScheduler();
    private task: Task | null = null;
    private job: Job | null = null;

    public constructor(
        @InjectConfig() private readonly config: Config,
        @Inject(DatabaseService) private readonly databaseService: DatabaseService,
        @Inject(DataSourceService) private readonly dataSourceService: DataSourceService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    public async onModuleInit() {
        const { crawlInterval } = this.config;

        this.task = new Task("Crawler", this.onWork.bind(this));

        if (typeof crawlInterval === "string") {
            if (isCronExpression(crawlInterval)) {
                this.job = new CronJob({ cronExpression: crawlInterval }, this.task, { preventOverrun: true });
            } else {
                this.job = new SimpleIntervalJob({ milliseconds: ms(crawlInterval) }, this.task, {
                    preventOverrun: true,
                });
            }
        } else {
            this.job = new SimpleIntervalJob({ milliseconds: crawlInterval }, this.task, { preventOverrun: true });
        }

        if (this.job instanceof CronJob) {
            this.scheduler.addCronJob(this.job);
        } else if (this.job instanceof SimpleIntervalJob) {
            this.scheduler.addSimpleIntervalJob(this.job);
        }

        this.logger.log(`Crawler scheduled to run {cyan}`, undefined, formatInterval(crawlInterval));
    }

    private async onWork() {
        try {
            this.logger.log(`Crawling task started`);

            const rawBoards: RawBoard[] = [];
            for await (const [, data] of this.dataSourceService.crawl()) {
                rawBoards.push(...data);
            }

            const { attachments, boards, posts } = await this.databaseService.write(rawBoards);
            this.logger.log(
                `Crawled {cyan}.`,
                undefined,
                [
                    `${boards.length} ${pluralize("board", boards.length)}`,
                    `${posts.length} ${pluralize("post", posts.length)}`,
                    `${attachments.length} ${pluralize("attachment", attachments.length)}`,
                ]
                    .filter(t => !t.startsWith("0"))
                    .join(", "),
            );

            this.eventEmitter.emit("attachment.created", new AttachmentCreatedEvent(attachments));

            this.logger.log(`Crawling task finished successfully`);
        } catch (error) {
            let message: string;
            let stack: string | undefined;
            if (error instanceof Error) {
                message = error.message;
                stack = error.stack;
            } else {
                message = `${error}`;
            }

            this.logger.error(`Crawling task failed with Error: {red}`, stack, undefined, message);
        }
    }

    public async start() {
        this.onWork();
    }
}
