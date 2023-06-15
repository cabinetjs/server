import ms from "ms";
import { CronJob, Job, SimpleIntervalJob, Task, ToadScheduler } from "toad-scheduler";

import { Inject, Injectable, OnModuleInit } from "@nestjs/common";

import { DataSourceService } from "@data-source/data-source.service";

import { BoardService } from "@board/board.service";
import { Board, RawBoard } from "@board/models/board.model";

import { ThreadService } from "@thread/thread.service";
import { RawThread, Thread } from "@thread/models/thread.model";

import { PostService } from "@post/post.service";
import { Post, RawPost } from "@post/models/post.model";

import { Config } from "@config/config.module";
import { InjectConfig } from "@config/config.decorator";

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
        @Inject(DataSourceService) private readonly dataSourceService: DataSourceService,
        @Inject(BoardService) private readonly boardService: BoardService,
        @Inject(ThreadService) private readonly threadService: ThreadService,
        @Inject(PostService) private readonly postService: PostService,
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

        for await (const [dataSourceName, data] of this.dataSourceService.crawl()) {
            const allThreads = data.flatMap(board => board.threads);
            const allPosts = [
                ...allThreads.flatMap(thread => thread.openingPost),
                ...allThreads.flatMap(thread => thread.replies),
            ];

            await this.logger.doWork({
                level: "log",
                message: "Write {cyan} threads and {cyan} posts in {cyan} boards into database",
                work: async () => {
                    const boards = this.composeBoards(dataSourceName, data);
                    const threads = boards.flatMap(board => board.threads);
                    const posts = [
                        ...threads.flatMap(thread => thread.openingPost),
                        ...threads.flatMap(thread => thread.replies),
                    ];

                    await this.postService.save(posts);
                    await this.threadService.save(threads);
                    await this.boardService.save(boards);
                },
                args: [allThreads.length, allPosts.length, data.length],
            });
        }

        this.logger.log(`Crawling task finished successfully`);
    }
    private async onWorkError(error: Error) {
        this.logger.error(`Crawling task failed with Error: {red}`, error.stack, undefined, error.message);
    }

    private composeBoards(dataSourceName: string, data: RawBoard[]): Board[] {
        const boards: Board[] = [];
        for (const item of data) {
            const data = this.boardService.create(item);
            data.id = `${dataSourceName}::${item.code}`;
            data.threads = this.composeThreads(dataSourceName, data, item.threads);

            boards.push(data);
        }

        return boards;
    }
    private composeThreads(dataSourceName: string, board: Board, data: RawThread[]): Thread[] {
        const threads: Thread[] = [];
        for (const item of data) {
            const data = this.threadService.create(item);
            data.id = `${dataSourceName}::${board.code}::${item.openingPost.no}`;
            data.openingPost = this.composePosts(dataSourceName, board, data, [item.openingPost])[0];
            data.replies = this.composePosts(dataSourceName, board, data, item.replies);

            threads.push(data);
        }

        return threads;
    }
    private composePosts(dataSourceName: string, board: Board, thread: Thread, data: RawPost[]): Post[] {
        const posts: Post[] = [];
        for (const item of data) {
            const data = this.postService.create(item);
            data.id = `${dataSourceName}::${board.code}::${thread.openingPost.no}::${item.no}`;

            posts.push(data);
        }

        return posts;
    }
}
