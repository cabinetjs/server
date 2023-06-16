import { NestFactory } from "@nestjs/core";

import { AppModule } from "@root/app.module";
import { CrawlerService } from "@crawler/crawler.service";

import { Logger } from "@utils/logger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: new Logger(),
    });

    await app.listen(3000);
    await app.get<CrawlerService>(CrawlerService).start();
}

bootstrap();
