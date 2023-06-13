import ms from "ms";
import { AsyncTask, CronJob, SimpleIntervalJob, ToadScheduler } from "toad-scheduler";

import { ConfigData, ConfigManager } from "@root/config";

import { Logger } from "@utils/logger";
import { formatInterval, isCronExpression } from "@utils/date";

interface ServerOptions {
    configFilePath: string;
}

export class Server {
    public static async initialize(options: ServerOptions): Promise<Server> {
        const { config } = await ConfigManager.initialize(options.configFilePath);

        return new Server(config);
    }

    private readonly logger = new Logger(Server.name);
    private readonly config: ConfigData;
    private readonly scheduler: ToadScheduler;

    private constructor(config: ConfigData) {
        this.config = config;
        this.scheduler = new ToadScheduler();
    }

    public async run(): Promise<void> {
        const formattedInterval = formatInterval(this.config.crawlInterval);
        const task = new AsyncTask("crawling task", async () => this.doCrawl(), this.handleCrawlError.bind(this));

        if (typeof this.config.crawlInterval === "string" && isCronExpression(this.config.crawlInterval)) {
            const job = new CronJob({ cronExpression: this.config.crawlInterval }, task, { preventOverrun: true });
            this.scheduler.addCronJob(job);
        } else {
            let milliseconds: number;
            if (typeof this.config.crawlInterval === "string") {
                milliseconds = ms(this.config.crawlInterval);
            } else {
                milliseconds = this.config.crawlInterval;
            }

            const job = new SimpleIntervalJob({ milliseconds }, task, { preventOverrun: true });
            this.scheduler.addSimpleIntervalJob(job);
        }

        this.logger.log("Crawling task scheduler started.");
        this.logger.log("Crawling task will run in {cyan}.", formattedInterval);
    }

    private async doCrawl(): Promise<void> {
        this.logger.log("Crawling task started.");
        this.logger.log("Crawling task finished.");
    }
    private async handleCrawlError(e: Error) {
        this.logger.error("Crawling task failed: {red}", e.stack, e.message);
    }
}
