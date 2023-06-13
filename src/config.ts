import fs from "fs-extra";
import Ajv from "ajv";
import betterAjvErrors from "better-ajv-errors";
import { application, IJsonApplication } from "typia";

import { InvalidConfigError } from "@utils/errors/invalid-config";
import { composeJsonSchema } from "@utils/json";
import { Logger } from "@utils/logger";

export interface ConfigData {
    crawlInterval: number | string;
}

const DEFAULT_CONFIG: ConfigData = {
    crawlInterval: "0 */1 * * *",
};

export class ConfigManager {
    private static readonly configSchema: IJsonApplication = application<[ConfigData], "ajv">();
    private static readonly logger: Logger = new Logger(ConfigManager.name);
    private static readonly ajv = new Ajv();

    public static async initialize(filePath: string): Promise<ConfigManager> {
        const schema = await composeJsonSchema<ConfigData>(ConfigManager.configSchema);
        if (!filePath) {
            throw new Error("Config file path is not defined");
        }

        const configData = await this.logger.doWork({
            level: "log",
            message: `Load configuration from {cyan}`,
            args: [`'${filePath}'`],
            work: async () => {
                if (!fs.existsSync(filePath)) {
                    this.logger.warn("Config file does not exist, will create a new one.");
                    await fs.writeJson(filePath, DEFAULT_CONFIG, { spaces: 4 });
                }

                const stat = await fs.stat(filePath);
                if (!stat.isFile()) {
                    throw new Error(`Given config file '${filePath}' is not a file`);
                }

                const configData = await fs.readJSON(filePath);
                const validate = ConfigManager.ajv.compile(schema);
                const valid = validate(configData);
                if (!valid && validate.errors) {
                    const error = betterAjvErrors(schema, configData, validate.errors, {
                        indent: 4,
                    });

                    throw new InvalidConfigError(
                        "Invalid config file found, please check the error message below:",
                        error,
                    );
                }

                return configData;
            },
        });

        if (process.env.NODE_ENV === "development") {
            await this.logger.doWork({
                level: "debug",
                message: "JSON schema definition {cyan}",
                args: [`'./cabinet.schema.json'`],
                work: async () => {
                    await fs.writeJSON(`cabinet.schema.json`, schema, { spaces: 4 });
                },
            });
        }

        return new ConfigManager(configData);
    }

    private readonly _config: ConfigData;

    public get config(): ConfigData {
        return { ...this._config };
    }

    private constructor(config: ConfigData) {
        this._config = config;
    }
}
