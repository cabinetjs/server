import { Test, TestingModule } from "@nestjs/testing";

import { DataSourceService } from "@data-source/data-source.service";
import { BoardService } from "@board/board.service";
import { PostService } from "@post/post.service";
import { AttachmentService } from "@attachment/attachment.service";
import { CrawlerService } from "@crawler/crawler.service";

import { StatisticService } from "@statistic/statistic.service";

describe("StatisticService", () => {
    let service: StatisticService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StatisticService,
                { provide: DataSourceService, useValue: {} },
                { provide: BoardService, useValue: {} },
                { provide: PostService, useValue: {} },
                { provide: AttachmentService, useValue: {} },
                { provide: CrawlerService, useValue: {} },
            ],
        }).compile();

        service = module.get<StatisticService>(StatisticService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
