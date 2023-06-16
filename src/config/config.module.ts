import fs from "fs-extra";
import { application, IJsonApplication } from "typia";
import Ajv from "ajv";
import betterAjvErrors from "better-ajv-errors";

import { DynamicModule } from "@nestjs/common";

import { DataSourceOptions } from "@data-source/types";
import { StorageOptions } from "@storage/types";

import { InvalidConfigError } from "@utils/errors/invalid-config";
import { composeJsonSchema } from "@utils/json";
import { Logger } from "@utils/logger";

export const CONFIG_DATA = Symbol("CONFIG_DATA");

export interface Config {
    dataSources: DataSourceOptions[];
    crawlInterval: number | string;
    storage: StorageOptions;
}

const DEFAULT_CONFIG: Config = {
    dataSources: [],
    crawlInterval: 1800000,
    storage: {
        type: "local",
        path: "./downloads",
    },
};

export class ConfigModule {
    private static readonly configSchema: IJsonApplication = application<[Config], "ajv">();
    private static readonly logger: Logger = new Logger(ConfigModule.name);
    private static readonly ajv = new Ajv();

    public static forRoot(configFilePath: string): DynamicModule {
        return {
            module: ConfigModule,
            imports: [],
            providers: [
                {
                    provide: CONFIG_DATA,
                    useFactory: () => ConfigModule.loadConfig(configFilePath),
                },
            ],
            exports: [CONFIG_DATA],
            global: true,
        };
    }

    private static async loadConfig(filePath: string): Promise<Config> {
        const schema = await composeJsonSchema<Config>(ConfigModule.configSchema);
        if (!filePath) {
            throw new Error("Config file path is not defined");
        }

        if (process.env.NODE_ENV === "development") {
            await this.logger.doWork({
                level: "debug",
                message: "JSON schema definition {cyan}",
                args: [`'${filePath}'`],
                work: async () => {
                    await fs.writeJSON(filePath, schema, { spaces: 4 });
                },
            });
        }

        return this.logger.doWork({
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
                const validate = ConfigModule.ajv.compile(schema);
                const valid = validate(configData);
                if (!valid && validate.errors) {
                    const error = betterAjvErrors(schema, configData, validate.errors, {
                        indent: 4,
                    });

                    throw new InvalidConfigError(
                        `Invalid config file found, please check the error message below:\n\n${error}\n`,
                        error,
                    );
                }

                return configData;
            },
        });
    }
}
