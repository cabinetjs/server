import ms from "ms";
import { CronJob, Job, SimpleIntervalJob, Task, ToadScheduler } from "toad-scheduler";

import { Inject, Injectable, OnModuleInit } from "@nestjs/common";

import { DatabaseService } from "@database/database.service";
import { DataSourceService } from "@data-source/data-source.service";

import { Config } from "@config/config.module";
import { InjectConfig } from "@config/config.decorator";

import { RawBoard } from "@board/models/board.model";

import { formatInterval, isCronExpression } from "@utils/date";
import { Logger } from "@utils/logger";

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
    ) {}

    public async onModuleInit() {
        const { crawlInterval } = this.config;

        this.task = new Task("Crawler", this.onWork.bind(this), this.onWorkError.bind(this));

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
        this.logger.log(`Crawling task started`);

        const boards: RawBoard[] = [];
        for await (const [, data] of this.dataSourceService.crawl()) {
            boards.push(...data);
        }

        await this.databaseService.write(boards);
        this.logger.log(`Crawling task finished successfully`);
    }
    private async onWorkError(error: Error) {
        this.logger.error(`Crawling task failed with Error: {red}`, error.stack, undefined, error.message);
    }
}
