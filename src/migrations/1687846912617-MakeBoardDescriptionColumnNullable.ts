import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeBoardDescriptionColumnNullable1687846912617 implements MigrationInterface {
    name = "MakeBoardDescriptionColumnNullable1687846912617";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "temporary_boards" ("id" varchar PRIMARY KEY NOT NULL, "code" varchar(255) NOT NULL, "name" varchar(255) NOT NULL, "description" text NOT NULL, "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_a1f0e64617fd4e562cd3a13ec75" UNIQUE ("uri"))`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_boards"("id", "code", "name", "description", "uri") SELECT "id", "code", "name", "description", "uri" FROM "boards"`,
        );
        await queryRunner.query(`DROP TABLE "boards"`);
        await queryRunner.query(`ALTER TABLE "temporary_boards" RENAME TO "boards"`);
        await queryRunner.query(
            `CREATE TABLE "temporary_boards" ("id" varchar PRIMARY KEY NOT NULL, "code" varchar(255) NOT NULL, "name" varchar(255) NOT NULL, "description" text NOT NULL, "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_a1f0e64617fd4e562cd3a13ec75" UNIQUE ("uri"))`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_boards"("id", "code", "name", "description", "uri") SELECT "id", "code", "name", "description", "uri" FROM "boards"`,
        );
        await queryRunner.query(`DROP TABLE "boards"`);
        await queryRunner.query(`ALTER TABLE "temporary_boards" RENAME TO "boards"`);
        await queryRunner.query(
            `CREATE TABLE "temporary_boards" ("id" varchar PRIMARY KEY NOT NULL, "code" varchar(255) NOT NULL, "name" varchar(255) NOT NULL, "description" text, "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_a1f0e64617fd4e562cd3a13ec75" UNIQUE ("uri"))`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_boards"("id", "code", "name", "description", "uri") SELECT "id", "code", "name", "description", "uri" FROM "boards"`,
        );
        await queryRunner.query(`DROP TABLE "boards"`);
        await queryRunner.query(`ALTER TABLE "temporary_boards" RENAME TO "boards"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "boards" RENAME TO "temporary_boards"`);
        await queryRunner.query(
            `CREATE TABLE "boards" ("id" varchar PRIMARY KEY NOT NULL, "code" varchar(255) NOT NULL, "name" varchar(255) NOT NULL, "description" text NOT NULL, "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_a1f0e64617fd4e562cd3a13ec75" UNIQUE ("uri"))`,
        );
        await queryRunner.query(
            `INSERT INTO "boards"("id", "code", "name", "description", "uri") SELECT "id", "code", "name", "description", "uri" FROM "temporary_boards"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_boards"`);
        await queryRunner.query(`ALTER TABLE "boards" RENAME TO "temporary_boards"`);
        await queryRunner.query(
            `CREATE TABLE "boards" ("id" varchar PRIMARY KEY NOT NULL, "code" varchar(255) NOT NULL, "name" varchar(255) NOT NULL, "description" text NOT NULL, "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_a1f0e64617fd4e562cd3a13ec75" UNIQUE ("uri"))`,
        );
        await queryRunner.query(
            `INSERT INTO "boards"("id", "code", "name", "description", "uri") SELECT "id", "code", "name", "description", "uri" FROM "temporary_boards"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_boards"`);
        await queryRunner.query(`ALTER TABLE "boards" RENAME TO "temporary_boards"`);
        await queryRunner.query(
            `CREATE TABLE "boards" ("id" varchar PRIMARY KEY NOT NULL, "code" varchar(255) NOT NULL, "name" varchar(255) NOT NULL, "description" text NOT NULL, "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_a1f0e64617fd4e562cd3a13ec75" UNIQUE ("uri"))`,
        );
        await queryRunner.query(
            `INSERT INTO "boards"("id", "code", "name", "description", "uri") SELECT "id", "code", "name", "description", "uri" FROM "temporary_boards"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_boards"`);
    }
}
