import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostAuthorColumn1687742425307 implements MigrationInterface {
    name = "AddPostAuthorColumn1687742425307";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "temporary_posts" ("id" varchar PRIMARY KEY NOT NULL, "parent" integer, "no" integer NOT NULL, "title" text, "content" text, "boardId" varchar, "uri" varchar(255) NOT NULL, "writtenAt" datetime NOT NULL, "author" varchar(255), CONSTRAINT "UQ_f1ab131f835e4ba4d9ab4577ad1" UNIQUE ("uri"), CONSTRAINT "FK_bb5c3576dcef389c98ed0cf7dfe" FOREIGN KEY ("boardId") REFERENCES "boards" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_posts"("id", "parent", "no", "title", "content", "boardId", "uri", "writtenAt") SELECT "id", "parent", "no", "title", "content", "boardId", "uri", "writtenAt" FROM "posts"`,
        );
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`ALTER TABLE "temporary_posts" RENAME TO "posts"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" RENAME TO "temporary_posts"`);
        await queryRunner.query(
            `CREATE TABLE "posts" ("id" varchar PRIMARY KEY NOT NULL, "parent" integer, "no" integer NOT NULL, "title" text, "content" text, "boardId" varchar, "uri" varchar(255) NOT NULL, "writtenAt" datetime NOT NULL, CONSTRAINT "UQ_f1ab131f835e4ba4d9ab4577ad1" UNIQUE ("uri"), CONSTRAINT "FK_bb5c3576dcef389c98ed0cf7dfe" FOREIGN KEY ("boardId") REFERENCES "boards" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "posts"("id", "parent", "no", "title", "content", "boardId", "uri", "writtenAt") SELECT "id", "parent", "no", "title", "content", "boardId", "uri", "writtenAt" FROM "temporary_posts"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_posts"`);
    }
}
