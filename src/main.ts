import { program } from "commander";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "@root/app.module";
import { CrawlerService } from "@crawler/crawler.service";

import { Logger } from "@utils/logger";

async function bootstrap() {
    program.option("-c, --config <path>", "Path to config file", "./cabinet.config.json").parse(process.argv);

    const options = program.opts();
    const configPath = options.config ?? "./cabinet.config.json";

    const app = await NestFactory.create(AppModule.forRoot(configPath), {
        logger: new Logger(),
    });

    await app.listen(3000);
    await app.get<CrawlerService>(CrawlerService).start();
}

bootstrap();
