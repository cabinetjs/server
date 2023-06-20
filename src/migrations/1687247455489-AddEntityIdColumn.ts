import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEntityIdColumn1687247455489 implements MigrationInterface {
    name = "AddEntityIdColumn1687247455489";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "temporary_attachments" ("id" varchar(255) PRIMARY KEY NOT NULL, "uid" varchar(255) NOT NULL, "url" text NOT NULL, "size" integer NOT NULL, "name" text NOT NULL, "extension" text NOT NULL, "hash" varchar(255) NOT NULL, "isStored" boolean NOT NULL DEFAULT (0), "storageData" text, "postId" varchar(255), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "storedAt" datetime, "thumbnailUrl" text, "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_91a9c5a1aa9994ac2ba1889b0e4" UNIQUE ("uri"), CONSTRAINT "FK_f54127860e8075e61dd7d95c80b" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_attachments"("id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt", "storedAt", "thumbnailUrl") SELECT "id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt", "storedAt", "thumbnailUrl" FROM "attachments"`,
        );
        await queryRunner.query(`DROP TABLE "attachments"`);
        await queryRunner.query(`ALTER TABLE "temporary_attachments" RENAME TO "attachments"`);
        await queryRunner.query(
            `CREATE TABLE "temporary_posts" ("id" varchar(255) PRIMARY KEY NOT NULL, "parent" integer, "no" integer NOT NULL, "title" text, "content" text, "boardId" varchar(255), "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_f1ab131f835e4ba4d9ab4577ad1" UNIQUE ("uri"), CONSTRAINT "FK_bb5c3576dcef389c98ed0cf7dfe" FOREIGN KEY ("boardId") REFERENCES "boards" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_posts"("id", "parent", "no", "title", "content", "boardId") SELECT "id", "parent", "no", "title", "content", "boardId" FROM "posts"`,
        );
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`ALTER TABLE "temporary_posts" RENAME TO "posts"`);
        await queryRunner.query(
            `CREATE TABLE "temporary_boards" ("id" varchar(255) PRIMARY KEY NOT NULL, "code" varchar(255) NOT NULL, "name" varchar(255) NOT NULL, "description" text NOT NULL, "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_a1f0e64617fd4e562cd3a13ec75" UNIQUE ("uri"))`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_boards"("id", "code", "name", "description") SELECT "id", "code", "name", "description" FROM "boards"`,
        );
        await queryRunner.query(`DROP TABLE "boards"`);
        await queryRunner.query(`ALTER TABLE "temporary_boards" RENAME TO "boards"`);
        await queryRunner.query(
            `CREATE TABLE "temporary_thumbnail" ("id" varchar PRIMARY KEY NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "size" integer NOT NULL, "path" varchar(255) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "attachmentId" varchar(255))`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_thumbnail"("id", "width", "height", "size", "path", "createdAt", "attachmentId") SELECT "id", "width", "height", "size", "path", "createdAt", "attachmentId" FROM "thumbnail"`,
        );
        await queryRunner.query(`DROP TABLE "thumbnail"`);
        await queryRunner.query(`ALTER TABLE "temporary_thumbnail" RENAME TO "thumbnail"`);
        await queryRunner.query(
            `CREATE TABLE "temporary_thumbnail" ("id" varchar PRIMARY KEY NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "size" integer NOT NULL, "path" varchar(255) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "attachmentId" varchar)`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_thumbnail"("id", "width", "height", "size", "path", "createdAt", "attachmentId") SELECT "id", "width", "height", "size", "path", "createdAt", "attachmentId" FROM "thumbnail"`,
        );
        await queryRunner.query(`DROP TABLE "thumbnail"`);
        await queryRunner.query(`ALTER TABLE "temporary_thumbnail" RENAME TO "thumbnail"`);
        await queryRunner.query(
            `CREATE TABLE "temporary_attachments" ("id" varchar(255) PRIMARY KEY NOT NULL, "uid" varchar(255) NOT NULL, "url" text NOT NULL, "size" integer NOT NULL, "name" text NOT NULL, "extension" text NOT NULL, "hash" varchar(255) NOT NULL, "isStored" boolean NOT NULL DEFAULT (0), "storageData" text, "postId" varchar(255), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "storedAt" datetime, "thumbnailUrl" text, "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_91a9c5a1aa9994ac2ba1889b0e4" UNIQUE ("uri"))`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_attachments"("id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt", "storedAt", "thumbnailUrl", "uri") SELECT "id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt", "storedAt", "thumbnailUrl", "uri" FROM "attachments"`,
        );
        await queryRunner.query(`DROP TABLE "attachments"`);
        await queryRunner.query(`ALTER TABLE "temporary_attachments" RENAME TO "attachments"`);
        await queryRunner.query(
            `CREATE TABLE "temporary_attachments" ("id" varchar PRIMARY KEY NOT NULL, "uid" varchar(255) NOT NULL, "url" text NOT NULL, "size" integer NOT NULL, "name" text NOT NULL, "extension" text NOT NULL, "hash" varchar(255) NOT NULL, "isStored" boolean NOT NULL DEFAULT (0), "storageData" text, "postId" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "storedAt" datetime, "thumbnailUrl" text, "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_91a9c5a1aa9994ac2ba1889b0e4" UNIQUE ("uri"))`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_attachments"("id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt", "storedAt", "thumbnailUrl", "uri") SELECT "id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt", "storedAt", "thumbnailUrl", "uri" FROM "attachments"`,
        );
        await queryRunner.query(`DROP TABLE "attachments"`);
        await queryRunner.query(`ALTER TABLE "temporary_attachments" RENAME TO "attachments"`);
        await queryRunner.query(
            `CREATE TABLE "temporary_posts" ("id" varchar(255) PRIMARY KEY NOT NULL, "parent" integer, "no" integer NOT NULL, "title" text, "content" text, "boardId" varchar(255), "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_f1ab131f835e4ba4d9ab4577ad1" UNIQUE ("uri"))`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_posts"("id", "parent", "no", "title", "content", "boardId", "uri") SELECT "id", "parent", "no", "title", "content", "boardId", "uri" FROM "posts"`,
        );
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`ALTER TABLE "temporary_posts" RENAME TO "posts"`);
        await queryRunner.query(
            `CREATE TABLE "temporary_posts" ("id" varchar PRIMARY KEY NOT NULL, "parent" integer, "no" integer NOT NULL, "title" text, "content" text, "boardId" varchar, "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_f1ab131f835e4ba4d9ab4577ad1" UNIQUE ("uri"))`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_posts"("id", "parent", "no", "title", "content", "boardId", "uri") SELECT "id", "parent", "no", "title", "content", "boardId", "uri" FROM "posts"`,
        );
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`ALTER TABLE "temporary_posts" RENAME TO "posts"`);
        await queryRunner.query(
            `CREATE TABLE "temporary_boards" ("id" varchar PRIMARY KEY NOT NULL, "code" varchar(255) NOT NULL, "name" varchar(255) NOT NULL, "description" text NOT NULL, "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_a1f0e64617fd4e562cd3a13ec75" UNIQUE ("uri"))`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_boards"("id", "code", "name", "description", "uri") SELECT "id", "code", "name", "description", "uri" FROM "boards"`,
        );
        await queryRunner.query(`DROP TABLE "boards"`);
        await queryRunner.query(`ALTER TABLE "temporary_boards" RENAME TO "boards"`);
        await queryRunner.query(
            `CREATE TABLE "temporary_thumbnail" ("id" varchar PRIMARY KEY NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "size" integer NOT NULL, "path" varchar(255) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "attachmentId" varchar, CONSTRAINT "FK_7643bfa386a703e8abdb799567f" FOREIGN KEY ("attachmentId") REFERENCES "attachments" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_thumbnail"("id", "width", "height", "size", "path", "createdAt", "attachmentId") SELECT "id", "width", "height", "size", "path", "createdAt", "attachmentId" FROM "thumbnail"`,
        );
        await queryRunner.query(`DROP TABLE "thumbnail"`);
        await queryRunner.query(`ALTER TABLE "temporary_thumbnail" RENAME TO "thumbnail"`);
        await queryRunner.query(
            `CREATE TABLE "temporary_attachments" ("id" varchar PRIMARY KEY NOT NULL, "uid" varchar(255) NOT NULL, "url" text NOT NULL, "size" integer NOT NULL, "name" text NOT NULL, "extension" text NOT NULL, "hash" varchar(255) NOT NULL, "isStored" boolean NOT NULL DEFAULT (0), "storageData" text, "postId" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "storedAt" datetime, "thumbnailUrl" text, "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_91a9c5a1aa9994ac2ba1889b0e4" UNIQUE ("uri"), CONSTRAINT "FK_f54127860e8075e61dd7d95c80b" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_attachments"("id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt", "storedAt", "thumbnailUrl", "uri") SELECT "id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt", "storedAt", "thumbnailUrl", "uri" FROM "attachments"`,
        );
        await queryRunner.query(`DROP TABLE "attachments"`);
        await queryRunner.query(`ALTER TABLE "temporary_attachments" RENAME TO "attachments"`);
        await queryRunner.query(
            `CREATE TABLE "temporary_posts" ("id" varchar PRIMARY KEY NOT NULL, "parent" integer, "no" integer NOT NULL, "title" text, "content" text, "boardId" varchar, "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_f1ab131f835e4ba4d9ab4577ad1" UNIQUE ("uri"), CONSTRAINT "FK_bb5c3576dcef389c98ed0cf7dfe" FOREIGN KEY ("boardId") REFERENCES "boards" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_posts"("id", "parent", "no", "title", "content", "boardId", "uri") SELECT "id", "parent", "no", "title", "content", "boardId", "uri" FROM "posts"`,
        );
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`ALTER TABLE "temporary_posts" RENAME TO "posts"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" RENAME TO "temporary_posts"`);
        await queryRunner.query(
            `CREATE TABLE "posts" ("id" varchar PRIMARY KEY NOT NULL, "parent" integer, "no" integer NOT NULL, "title" text, "content" text, "boardId" varchar, "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_f1ab131f835e4ba4d9ab4577ad1" UNIQUE ("uri"))`,
        );
        await queryRunner.query(
            `INSERT INTO "posts"("id", "parent", "no", "title", "content", "boardId", "uri") SELECT "id", "parent", "no", "title", "content", "boardId", "uri" FROM "temporary_posts"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_posts"`);
        await queryRunner.query(`ALTER TABLE "attachments" RENAME TO "temporary_attachments"`);
        await queryRunner.query(
            `CREATE TABLE "attachments" ("id" varchar PRIMARY KEY NOT NULL, "uid" varchar(255) NOT NULL, "url" text NOT NULL, "size" integer NOT NULL, "name" text NOT NULL, "extension" text NOT NULL, "hash" varchar(255) NOT NULL, "isStored" boolean NOT NULL DEFAULT (0), "storageData" text, "postId" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "storedAt" datetime, "thumbnailUrl" text, "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_91a9c5a1aa9994ac2ba1889b0e4" UNIQUE ("uri"))`,
        );
        await queryRunner.query(
            `INSERT INTO "attachments"("id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt", "storedAt", "thumbnailUrl", "uri") SELECT "id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt", "storedAt", "thumbnailUrl", "uri" FROM "temporary_attachments"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_attachments"`);
        await queryRunner.query(`ALTER TABLE "thumbnail" RENAME TO "temporary_thumbnail"`);
        await queryRunner.query(
            `CREATE TABLE "thumbnail" ("id" varchar PRIMARY KEY NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "size" integer NOT NULL, "path" varchar(255) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "attachmentId" varchar)`,
        );
        await queryRunner.query(
            `INSERT INTO "thumbnail"("id", "width", "height", "size", "path", "createdAt", "attachmentId") SELECT "id", "width", "height", "size", "path", "createdAt", "attachmentId" FROM "temporary_thumbnail"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_thumbnail"`);
        await queryRunner.query(`ALTER TABLE "boards" RENAME TO "temporary_boards"`);
        await queryRunner.query(
            `CREATE TABLE "boards" ("id" varchar(255) PRIMARY KEY NOT NULL, "code" varchar(255) NOT NULL, "name" varchar(255) NOT NULL, "description" text NOT NULL, "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_a1f0e64617fd4e562cd3a13ec75" UNIQUE ("uri"))`,
        );
        await queryRunner.query(
            `INSERT INTO "boards"("id", "code", "name", "description", "uri") SELECT "id", "code", "name", "description", "uri" FROM "temporary_boards"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_boards"`);
        await queryRunner.query(`ALTER TABLE "posts" RENAME TO "temporary_posts"`);
        await queryRunner.query(
            `CREATE TABLE "posts" ("id" varchar(255) PRIMARY KEY NOT NULL, "parent" integer, "no" integer NOT NULL, "title" text, "content" text, "boardId" varchar(255), "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_f1ab131f835e4ba4d9ab4577ad1" UNIQUE ("uri"))`,
        );
        await queryRunner.query(
            `INSERT INTO "posts"("id", "parent", "no", "title", "content", "boardId", "uri") SELECT "id", "parent", "no", "title", "content", "boardId", "uri" FROM "temporary_posts"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_posts"`);
        await queryRunner.query(`ALTER TABLE "posts" RENAME TO "temporary_posts"`);
        await queryRunner.query(
            `CREATE TABLE "posts" ("id" varchar(255) PRIMARY KEY NOT NULL, "parent" integer, "no" integer NOT NULL, "title" text, "content" text, "boardId" varchar(255), "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_f1ab131f835e4ba4d9ab4577ad1" UNIQUE ("uri"), CONSTRAINT "FK_bb5c3576dcef389c98ed0cf7dfe" FOREIGN KEY ("boardId") REFERENCES "boards" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "posts"("id", "parent", "no", "title", "content", "boardId", "uri") SELECT "id", "parent", "no", "title", "content", "boardId", "uri" FROM "temporary_posts"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_posts"`);
        await queryRunner.query(`ALTER TABLE "attachments" RENAME TO "temporary_attachments"`);
        await queryRunner.query(
            `CREATE TABLE "attachments" ("id" varchar(255) PRIMARY KEY NOT NULL, "uid" varchar(255) NOT NULL, "url" text NOT NULL, "size" integer NOT NULL, "name" text NOT NULL, "extension" text NOT NULL, "hash" varchar(255) NOT NULL, "isStored" boolean NOT NULL DEFAULT (0), "storageData" text, "postId" varchar(255), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "storedAt" datetime, "thumbnailUrl" text, "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_91a9c5a1aa9994ac2ba1889b0e4" UNIQUE ("uri"))`,
        );
        await queryRunner.query(
            `INSERT INTO "attachments"("id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt", "storedAt", "thumbnailUrl", "uri") SELECT "id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt", "storedAt", "thumbnailUrl", "uri" FROM "temporary_attachments"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_attachments"`);
        await queryRunner.query(`ALTER TABLE "attachments" RENAME TO "temporary_attachments"`);
        await queryRunner.query(
            `CREATE TABLE "attachments" ("id" varchar(255) PRIMARY KEY NOT NULL, "uid" varchar(255) NOT NULL, "url" text NOT NULL, "size" integer NOT NULL, "name" text NOT NULL, "extension" text NOT NULL, "hash" varchar(255) NOT NULL, "isStored" boolean NOT NULL DEFAULT (0), "storageData" text, "postId" varchar(255), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "storedAt" datetime, "thumbnailUrl" text, "uri" varchar(255) NOT NULL, CONSTRAINT "UQ_91a9c5a1aa9994ac2ba1889b0e4" UNIQUE ("uri"), CONSTRAINT "FK_f54127860e8075e61dd7d95c80b" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "attachments"("id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt", "storedAt", "thumbnailUrl", "uri") SELECT "id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt", "storedAt", "thumbnailUrl", "uri" FROM "temporary_attachments"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_attachments"`);
        await queryRunner.query(`ALTER TABLE "thumbnail" RENAME TO "temporary_thumbnail"`);
        await queryRunner.query(
            `CREATE TABLE "thumbnail" ("id" varchar PRIMARY KEY NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "size" integer NOT NULL, "path" varchar(255) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "attachmentId" varchar(255))`,
        );
        await queryRunner.query(
            `INSERT INTO "thumbnail"("id", "width", "height", "size", "path", "createdAt", "attachmentId") SELECT "id", "width", "height", "size", "path", "createdAt", "attachmentId" FROM "temporary_thumbnail"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_thumbnail"`);
        await queryRunner.query(`ALTER TABLE "thumbnail" RENAME TO "temporary_thumbnail"`);
        await queryRunner.query(
            `CREATE TABLE "thumbnail" ("id" varchar PRIMARY KEY NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "size" integer NOT NULL, "path" varchar(255) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "attachmentId" varchar(255), CONSTRAINT "FK_7643bfa386a703e8abdb799567f" FOREIGN KEY ("attachmentId") REFERENCES "attachments" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "thumbnail"("id", "width", "height", "size", "path", "createdAt", "attachmentId") SELECT "id", "width", "height", "size", "path", "createdAt", "attachmentId" FROM "temporary_thumbnail"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_thumbnail"`);
        await queryRunner.query(`ALTER TABLE "boards" RENAME TO "temporary_boards"`);
        await queryRunner.query(
            `CREATE TABLE "boards" ("id" varchar(255) PRIMARY KEY NOT NULL, "code" varchar(255) NOT NULL, "name" varchar(255) NOT NULL, "description" text NOT NULL)`,
        );
        await queryRunner.query(
            `INSERT INTO "boards"("id", "code", "name", "description") SELECT "id", "code", "name", "description" FROM "temporary_boards"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_boards"`);
        await queryRunner.query(`ALTER TABLE "posts" RENAME TO "temporary_posts"`);
        await queryRunner.query(
            `CREATE TABLE "posts" ("id" varchar(255) PRIMARY KEY NOT NULL, "parent" integer, "no" integer NOT NULL, "title" text, "content" text, "boardId" varchar(255), CONSTRAINT "FK_bb5c3576dcef389c98ed0cf7dfe" FOREIGN KEY ("boardId") REFERENCES "boards" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "posts"("id", "parent", "no", "title", "content", "boardId") SELECT "id", "parent", "no", "title", "content", "boardId" FROM "temporary_posts"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_posts"`);
        await queryRunner.query(`ALTER TABLE "attachments" RENAME TO "temporary_attachments"`);
        await queryRunner.query(
            `CREATE TABLE "attachments" ("id" varchar(255) PRIMARY KEY NOT NULL, "uid" varchar(255) NOT NULL, "url" text NOT NULL, "size" integer NOT NULL, "name" text NOT NULL, "extension" text NOT NULL, "hash" varchar(255) NOT NULL, "isStored" boolean NOT NULL DEFAULT (0), "storageData" text, "postId" varchar(255), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "storedAt" datetime, "thumbnailUrl" text, CONSTRAINT "FK_f54127860e8075e61dd7d95c80b" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "attachments"("id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt", "storedAt", "thumbnailUrl") SELECT "id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt", "storedAt", "thumbnailUrl" FROM "temporary_attachments"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_attachments"`);
    }
}
