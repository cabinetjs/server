import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAttachmentStoredAtColumn1687175046026 implements MigrationInterface {
    name = "AddAttachmentStoredAtColumn1687175046026";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "temporary_attachments" ("id" varchar(255) PRIMARY KEY NOT NULL, "uid" varchar(255) NOT NULL, "url" text NOT NULL, "size" integer NOT NULL, "name" text NOT NULL, "extension" text NOT NULL, "hash" varchar(255) NOT NULL, "isStored" boolean NOT NULL DEFAULT (0), "storageData" text, "postId" varchar(255), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "storedAt" datetime, CONSTRAINT "FK_f54127860e8075e61dd7d95c80b" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_attachments"("id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt") SELECT "id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt" FROM "attachments"`,
        );
        await queryRunner.query(`DROP TABLE "attachments"`);
        await queryRunner.query(`ALTER TABLE "temporary_attachments" RENAME TO "attachments"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attachments" RENAME TO "temporary_attachments"`);
        await queryRunner.query(
            `CREATE TABLE "attachments" ("id" varchar(255) PRIMARY KEY NOT NULL, "uid" varchar(255) NOT NULL, "url" text NOT NULL, "size" integer NOT NULL, "name" text NOT NULL, "extension" text NOT NULL, "hash" varchar(255) NOT NULL, "isStored" boolean NOT NULL DEFAULT (0), "storageData" text, "postId" varchar(255), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_f54127860e8075e61dd7d95c80b" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "attachments"("id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt") SELECT "id", "uid", "url", "size", "name", "extension", "hash", "isStored", "storageData", "postId", "createdAt" FROM "temporary_attachments"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_attachments"`);
    }
}
