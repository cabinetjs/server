import { Test, TestingModule } from "@nestjs/testing";

import { DataSourceService } from "@data-source/data-source.service";
import { AttachmentService } from "@attachment/attachment.service";

import { configMock } from "../../test/config.mock";
import { PostService } from "@post/post.service";

describe("DataSourceService", () => {
    let service: DataSourceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DataSourceService,
                configMock,
                { provide: AttachmentService, useValue: {} },
                { provide: PostService, useValue: {} },
            ],
        }).compile();

        service = module.get<DataSourceService>(DataSourceService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
