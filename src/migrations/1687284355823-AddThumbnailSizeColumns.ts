import { MigrationInterface, QueryRunner } from "typeorm";

export class AddThumbnailSizeColumns1687284355823 implements MigrationInterface {
    name = "AddThumbnailSizeColumns1687284355823";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "temporary_thumbnail" ("id" varchar PRIMARY KEY NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "size" integer NOT NULL, "path" varchar(255) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "attachmentId" varchar, "filesize" integer NOT NULL, CONSTRAINT "FK_7643bfa386a703e8abdb799567f" FOREIGN KEY ("attachmentId") REFERENCES "attachments" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "temporary_thumbnail"("id", "width", "height", "size", "path", "createdAt", "attachmentId") SELECT "id", "width", "height", "size", "path", "createdAt", "attachmentId" FROM "thumbnail"`,
        );
        await queryRunner.query(`DROP TABLE "thumbnail"`);
        await queryRunner.query(`ALTER TABLE "temporary_thumbnail" RENAME TO "thumbnail"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "thumbnail" RENAME TO "temporary_thumbnail"`);
        await queryRunner.query(
            `CREATE TABLE "thumbnail" ("id" varchar PRIMARY KEY NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "size" integer NOT NULL, "path" varchar(255) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "attachmentId" varchar, CONSTRAINT "FK_7643bfa386a703e8abdb799567f" FOREIGN KEY ("attachmentId") REFERENCES "attachments" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
        );
        await queryRunner.query(
            `INSERT INTO "thumbnail"("id", "width", "height", "size", "path", "createdAt", "attachmentId") SELECT "id", "width", "height", "size", "path", "createdAt", "attachmentId" FROM "temporary_thumbnail"`,
        );
        await queryRunner.query(`DROP TABLE "temporary_thumbnail"`);
    }
}
