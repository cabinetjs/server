import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1686956676058 implements MigrationInterface {
    name = "CreateTables1686956676058";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "boards" ("id" varchar(255) PRIMARY KEY NOT NULL, "code" varchar(255) NOT NULL, "name" varchar(255) NOT NULL, "description" text NOT NULL)`,
        );
        await queryRunner.query(
            `CREATE TABLE "posts" ("id" varchar(255) PRIMARY KEY NOT NULL, "parent" integer, "no" integer NOT NULL, "title" text, "content" text, "boardId" varchar(255))`,
        );
        await queryRunner.query(
            `CREATE TABLE "attachments" ("id" varchar(255) PRIMARY KEY NOT NULL, "uid" varchar(255) NOT NULL, "url" text NOT NULL, "size" integer NOT NULL, "name" text NOT NULL, "extension" text NOT NULL, "hash" varchar(255) NOT NULL, "isStored" boolean NOT NULL DEFAULT (0), "storageData" text, "postId" varchar(255))`,
        );
        await queryRunner.query(
            `CREATE TABLE "temporary_posts" ("id" varchar(255) PRIMARY KEY NOT NULL, "parent" integer, "no" integer NOT NULL, "title" text, "content" text, "boardId" varchar(255), CONSTRAINT "FK_bb5c3576dcef389c98ed0cf7dfe" FOREIGN KEY ("boardId") REFERENCES "boards" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_posts"("id", "parent", "no", "title", "content", "boardId") SELECT "id", "parent", "no", "title", "content", "boardId" FROM "posts"`,
        );
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`ALTER TABLE "temporary_posts" RENAME TO "posts"`);
        await queryRunner.query(
            `CREATE TABLE "temporary_attachments" ("id" varchar(255) PRIMARY KEY NOT NULL, "uid" varchar(255) NOT NULL, "url" text NOT NULL, "size" integer NOT NULL, "name" text NOT NULL, "extension" text NOT NULL, "hash" varchar(255) NOT NULL, "isStored" boolean NOT NULL DEFAULT (0), "storageData" text, "postId" varchar(255), CONSTRAINT "FK_f54127860e8075e61dd7d95c80b" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_attachments"("id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId") SELECT "id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId" FROM "attachments"`,
        );
        await queryRunner.query(`DROP TABLE "attachments"`);
        await queryRunner.query(`ALTER TABLE "temporary_attachments" RENAME TO "attachments"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attachments" RENAME TO "temporary_attachments"`);
        await queryRunner.query(
            `CREATE TABLE "attachments" ("id" varchar(255) PRIMARY KEY NOT NULL, "uid" varchar(255) NOT NULL, "url" text NOT NULL, "size" integer NOT NULL, "name" text NOT NULL, "extension" text NOT NULL, "hash" varchar(255) NOT NULL, "isStored" boolean NOT NULL DEFAULT (0), "storageData" text, "postId" varchar(255))`,
        );
        await queryRunner.query(
            `INSERT INTO "attachments"("id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId") SELECT "id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId" FROM "temporary_attachments"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_attachments"`);
        await queryRunner.query(`ALTER TABLE "posts" RENAME TO "temporary_posts"`);
        await queryRunner.query(
            `CREATE TABLE "posts" ("id" varchar(255) PRIMARY KEY NOT NULL, "parent" integer, "no" integer NOT NULL, "title" text, "content" text, "boardId" varchar(255))`,
        );
        await queryRunner.query(
            `INSERT INTO "posts"("id", "parent", "no", "title", "content", "boardId") SELECT "id", "parent", "no", "title", "content", "boardId" FROM "temporary_posts"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_posts"`);
        await queryRunner.query(`DROP TABLE "attachments"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP TABLE "boards"`);
    }
}
