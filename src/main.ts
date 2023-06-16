import { program } from "commander";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "@root/app.module";
import { CrawlerService } from "@crawler/crawler.service";

import { drawLine, printTitle, TITLE_WIDTH } from "@utils/cli";
import { Logger } from "@utils/logger";

async function bootstrap() {
    program.option("-c, --config <path>", "Path to config file", "./cabinet.config.json").parse(process.argv);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require("../package.json");
    const options = program.opts();
    const configPath = options.config ?? "./cabinet.config.json";

    printTitle(pkg.version);
    drawLine(TITLE_WIDTH * 1.5, "=");

    const app = await NestFactory.create(AppModule.forRoot(configPath), {
        logger: new Logger(),
    });

    await app.listen(3000);
    await app.get<CrawlerService>(CrawlerService).start();
}

bootstrap();
