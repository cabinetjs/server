import { program } from "commander";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "@root/app.module";
import { CrawlerService } from "@crawler/crawler.service";

import { drawLine, printTitle, TITLE_WIDTH } from "@utils/cli";
import { Logger } from "@utils/logger";

interface CLIOptions {
    config: string;
    dropDatabase: boolean;
}

async function bootstrap() {
    program
        .option("-c, --config <path>", "Path to config file", "./cabinet.config.json")
        .option("-d, --drop-database", "Drop database before start", false)
        .parse(process.argv);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require("../package.json");
    const options = program.opts<CLIOptions>();
    const configPath = options.config ?? "./cabinet.config.json";

    printTitle(pkg.version);
    drawLine(TITLE_WIDTH * 1.5, "=");

    const app = await NestFactory.create(AppModule.forRoot(configPath, options.dropDatabase), {
        logger: new Logger(),
    });

    await app.listen(3000);
    await app.get<CrawlerService>(CrawlerService).start();
}

bootstrap();
