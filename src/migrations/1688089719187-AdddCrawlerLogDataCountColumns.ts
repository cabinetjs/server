import { MigrationInterface, QueryRunner } from "typeorm";

export class AdddCrawlerLogDataCountColumns1688089719187 implements MigrationInterface {
    name = "AdddCrawlerLogDataCountColumns1688089719187";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "temporary_crawler-logs" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "startedAt" datetime NOT NULL, "finishedAt" datetime NOT NULL, "success" boolean NOT NULL, "boardCount" integer NOT NULL DEFAULT (0), "postCount" integer NOT NULL DEFAULT (0), "attachmentCount" integer NOT NULL DEFAULT (0))`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_crawler-logs"("id", "startedAt", "finishedAt", "success") SELECT "id", "startedAt", "finishedAt", "success" FROM "crawler-logs"`,
        );
        await queryRunner.query(`DROP TABLE "crawler-logs"`);
        await queryRunner.query(`ALTER TABLE "temporary_crawler-logs" RENAME TO "crawler-logs"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crawler-logs" RENAME TO "temporary_crawler-logs"`);
        await queryRunner.query(
            `CREATE TABLE "crawler-logs" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "startedAt" datetime NOT NULL, "finishedAt" datetime NOT NULL, "success" boolean NOT NULL)`,
        );
        await queryRunner.query(
            `INSERT INTO "crawler-logs"("id", "startedAt", "finishedAt", "success") SELECT "id", "startedAt", "finishedAt", "success" FROM "temporary_crawler-logs"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_crawler-logs"`);
    }
}
