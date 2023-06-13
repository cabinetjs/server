import { Server } from "@root/server";

import { InvalidConfigError } from "@utils/errors/invalid-config";

import { Logger } from "@utils/logger";

async function clearConsole() {
    process.stdout.write("\x1Bc");
}

async function main() {
    const logger = new Logger("App");

    try {
        const app = await Server.initialize({
            configFilePath: "./cabinet.config.json",
        });

        await app.run();
    } catch (e) {
        let message: string;
        if (e instanceof Error) {
            message = e.message;
        } else {
            message = JSON.stringify(e);
        }

        if (e instanceof InvalidConfigError) {
            logger.error(message);
            console.error(e.error);

            return;
        }

        logger.error(message);
    }
}

clearConsole().then(main).then();
