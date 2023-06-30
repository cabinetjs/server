import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEntityCreatedDateColumn1688075939982 implements MigrationInterface {
    name = "AddEntityCreatedDateColumn1688075939982";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "temporary_boards" ("id" varchar PRIMARY KEY NOT NULL, "code" varchar(255) NOT NULL, "name" varchar(255) NOT NULL, "description" text, "uri" varchar(255) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_a1f0e64617fd4e562cd3a13ec75" UNIQUE ("uri"))`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_boards"("id", "code", "name", "description", "uri") SELECT "id", "code", "name", "description", "uri" FROM "boards"`,
        );
        await queryRunner.query(`DROP TABLE "boards"`);
        await queryRunner.query(`ALTER TABLE "temporary_boards" RENAME TO "boards"`);
        await queryRunner.query(
            `CREATE TABLE "temporary_posts" ("id" varchar PRIMARY KEY NOT NULL, "parent" integer, "no" integer NOT NULL, "title" text, "content" text, "boardId" varchar, "uri" varchar(255) NOT NULL, "writtenAt" datetime NOT NULL, "author" varchar(255), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_f1ab131f835e4ba4d9ab4577ad1" UNIQUE ("uri"), CONSTRAINT "FK_bb5c3576dcef389c98ed0cf7dfe" FOREIGN KEY ("boardId") REFERENCES "boards" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_posts"("id", "parent", "no", "title", "content", "boardId", "uri", "writtenAt", "author") SELECT "id", "parent", "no", "title", "content", "boardId", "uri", "writtenAt", "author" FROM "posts"`,
        );
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`ALTER TABLE "temporary_posts" RENAME TO "posts"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" RENAME TO "temporary_posts"`);
        await queryRunner.query(
            `CREATE TABLE "posts" ("id" varchar PRIMARY KEY NOT NULL, "parent" integer, "no" integer NOT NULL, "title" text, "content" text, "boardId" varchar, "uri" varchar(255) NOT NULL, "writtenAt" datetime NOT NULL, "author" varchar(255), CONSTRAINT "UQ_f1ab131f835e4ba4d9ab4577ad1" UNIQUE ("uri"), CONSTRAINT "FK_bb5c3576dcef389c98ed0cf7dfe" FOREIGN KEY ("boardId") REFERENCES "boards" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "posts"("id", "parent", "no", "title", "content", "boardId", "uri", "writtenAt", "author") SELECT "id", "parent", "no", "title", "content", "boardId", "uri", "writtenAt", "author" FROM "temporary_posts"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_posts"`);
        await queryRunner.query(`ALTER TABLE "boards" RENAME TO "temporary_boards"`);
        await queryRunner.query(
            `CREATE TABLE "boards" ("id" varchar PRIMARY KEY NOT NULL, "code" varchar(255) NOT NULL, "name" varchar(255) NOT NULL, "description" text, "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_a1f0e64617fd4e562cd3a13ec75" UNIQUE ("uri"))`,
        );
        await queryRunner.query(
            `INSERT INTO "boards"("id", "code", "name", "description", "uri") SELECT "id", "code", "name", "description", "uri" FROM "temporary_boards"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_boards"`);
    }
}
