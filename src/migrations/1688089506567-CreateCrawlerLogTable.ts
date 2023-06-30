import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCrawlerLogTable1688089506567 implements MigrationInterface {
    name = "CreateCrawlerLogTable1688089506567";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "crawler-logs" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "startedAt" datetime NOT NULL, "finishedAt" datetime NOT NULL, "success" boolean NOT NULL)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "crawler-logs"`);
    }
}
