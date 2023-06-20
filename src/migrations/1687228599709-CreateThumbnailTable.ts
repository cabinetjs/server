import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateThumbnailTable1687228599709 implements MigrationInterface {
    name = "CreateThumbnailTable1687228599709";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "thumbnail" ("id" varchar PRIMARY KEY NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "size" integer NOT NULL, "path" varchar(255) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "thumbnail"`);
    }
}
