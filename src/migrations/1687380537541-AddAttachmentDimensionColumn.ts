import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAttachmentDimensionColumn1687380537541 implements MigrationInterface {
    name = "AddAttachmentDimensionColumn1687380537541";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "temporary_attachments" ("id" varchar PRIMARY KEY NOT NULL, "uid" varchar(255) NOT NULL, "url" text NOT NULL, "size" integer NOT NULL, "name" text NOT NULL, "extension" text NOT NULL, "hash" varchar(255) NOT NULL, "isStored" boolean NOT NULL DEFAULT (0), "storageData" text, "postId" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "storedAt" datetime, "thumbnailUrl" text, "uri" varchar(255) NOT NULL, "mimeType" varchar(255), "width" integer, "height" integer, CONSTRAINT "UQ_91a9c5a1aa9994ac2ba1889b0e4" UNIQUE ("uri"), CONSTRAINT "FK_f54127860e8075e61dd7d95c80b" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_attachments"("id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt", "storedAt", "thumbnailUrl", "uri", "mimeType") SELECT "id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt", "storedAt", "thumbnailUrl", "uri", "mimeType" FROM "attachments"`,
        );
        await queryRunner.query(`DROP TABLE "attachments"`);
        await queryRunner.query(`ALTER TABLE "temporary_attachments" RENAME TO "attachments"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attachments" RENAME TO "temporary_attachments"`);
        await queryRunner.query(
            `CREATE TABLE "attachments" ("id" varchar PRIMARY KEY NOT NULL, "uid" varchar(255) NOT NULL, "url" text NOT NULL, "size" integer NOT NULL, "name" text NOT NULL, "extension" text NOT NULL, "hash" varchar(255) NOT NULL, "isStored" boolean NOT NULL DEFAULT (0), "storageData" text, "postId" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "storedAt" datetime, "thumbnailUrl" text, "uri" varchar(255) NOT NULL, "mimeType" varchar(255), CONSTRAINT "UQ_91a9c5a1aa9994ac2ba1889b0e4" UNIQUE ("uri"), CONSTRAINT "FK_f54127860e8075e61dd7d95c80b" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "attachments"("id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt", "storedAt", "thumbnailUrl", "uri", "mimeType") SELECT "id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt", "storedAt", "thumbnailUrl", "uri", "mimeType" FROM "temporary_attachments"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_attachments"`);
    }
}
