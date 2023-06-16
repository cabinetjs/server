import { DataSource } from "typeorm";
import { config } from "dotenv";
import * as path from "path";

config({
    path: path.join(process.cwd(), ".env.development"),
});

export default new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    entities: [`${__dirname}/**/*.model{.ts,.js}`],
    dropSchema: false,
    migrationsRun: true,
});
