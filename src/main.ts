import { program } from "commander";
import path from "path";
import fs from "fs-extra";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "@root/app.module";
import { CrawlerService } from "@crawler/crawler.service";

import { drawLine, printTitle, TITLE_WIDTH } from "@utils/cli";
import { Logger } from "@utils/logger";
import { ConfigModule } from "@config/config.module";

interface CLIOptions {
    config: string;
    dropDatabase: boolean;
    databasePath: string;
}

async function bootstrap() {
    program
        .option("-c, --config <path>", "Path to config file", "./cabinet.config.json")
        .option("-p, --database-path <path>", "Path to database file", "./database.sqlite")
        .option("-d, --drop-database", "Drop database before start", false)
        .parse(process.argv);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require("../package.json");
    const options = program.opts<CLIOptions>();
    const configPath = process.env.CABINETJS_CONFIG_PATH ?? options.config ?? "./cabinet.config.json";
    let databasePath = process.env.CABINETJS_DATABASE_PATH ?? options.databasePath ?? "./database.sqlite";
    if (!path.isAbsolute(databasePath)) {
        databasePath = path.join(process.cwd(), databasePath);

        const directoryPath = path.dirname(databasePath);
        await fs.ensureDir(directoryPath);
    }

    printTitle(pkg.version);
    drawLine(TITLE_WIDTH * 1.5, "=");

    const config = await ConfigModule.loadConfig(configPath);
    const app = await NestFactory.create(AppModule.forRoot(config, options.dropDatabase, databasePath), {
        logger: new Logger(),
        cors: {
            origin: "*",
        },
    });

    if (config.api && "port" in config.api) {
        await app.listen(config.api.port);
    }

    await app.get<CrawlerService>(CrawlerService).start();
}

bootstrap();
