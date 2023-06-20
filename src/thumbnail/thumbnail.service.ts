import fileType from "file-type";
import sharp from "sharp";
import path from "path";
import fs from "fs-extra";
import { Repository } from "typeorm";

import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Thumbnail } from "@thumbnail/models/thumbnail.model";
import { Attachment } from "@attachment/models/attachment.model";

import { Config } from "@config/config.module";
import { InjectConfig } from "@config/config.decorator";

import { StorageService } from "@storage/storage.service";

import { BaseService } from "@common/base.service";
import { screenshotVideo } from "@utils/media";

interface RectThumbnailSize {
    width: number;
    height: number;
}

interface SingularThumbnailSize {
    size: number;
}

@Injectable()
export class ThumbnailService extends BaseService<Thumbnail> {
    private readonly thumbnailPath: string;

    public constructor(
        @InjectConfig() private readonly config: Config,
        @InjectRepository(Thumbnail) private readonly thumbnailRepository: Repository<Thumbnail>,
        @Inject(StorageService) private readonly storageService: StorageService,
    ) {
        super(Thumbnail, thumbnailRepository);

        let thumbnailPath = config.thumbnailPath || "./thumbnails";
        if (!path.isAbsolute(thumbnailPath)) {
            thumbnailPath = path.join(process.cwd(), thumbnailPath);
        }

        this.thumbnailPath = thumbnailPath;
    }

    public async fromAttachment(
        attachment: Attachment,
        size: RectThumbnailSize | SingularThumbnailSize,
    ): Promise<Thumbnail | null> {
        let queryBuilder = this.thumbnailRepository
            .createQueryBuilder("t")
            .select("t.id", "id")
            .where("t.attachmentId = :attachmentId", { attachmentId: attachment.uri });

        if ("width" in size) {
            const { width, height } = size;

            queryBuilder = queryBuilder
                .andWhere("t.width = :width", { width })
                .andWhere("t.height = :height", { height });
        } else {
            const { size: thumbnailSize } = size;

            queryBuilder = queryBuilder.andWhere("t.size = :size", { size: thumbnailSize });
        }

        const item = await queryBuilder.getRawOne<{ id: string }>();

        if (!item) {
            return null;
        }

        return this.findOne({
            where: { id: item.id },
        });
    }

    public async ensure(attachment: Attachment, size: RectThumbnailSize | SingularThumbnailSize): Promise<Thumbnail> {
        let thumbnail = await this.fromAttachment(attachment, size);
        if (thumbnail) {
            return thumbnail;
        }

        const buffer = await this.storageService.pull(attachment);
        const type = await fileType.fromBuffer(buffer);
        if (!type) {
            throw new Error("Unknown file type");
        }

        let image: Buffer;
        if (type.mime.startsWith("video/")) {
            image = await screenshotVideo(buffer, {
                count: 1,
                timestamps: ["50%"],
            });
        } else if (type.mime.startsWith("image/")) {
            image = buffer;
        } else {
            throw new Error(`Unsupported file type: ${type.mime}`);
        }

        let thumbnailBuffer: Buffer;
        if ("width" in size) {
            const { width, height } = size;
            thumbnailBuffer = await sharp(image)
                .resize({
                    width,
                    height,
                    fit: "cover",
                })
                .toBuffer();
        } else {
            const { size: thumbnailSize } = size;
            const { width, height } = await sharp(image).metadata();
            if (!width || !height) {
                throw new Error("Failed to get image size");
            }

            const targetDimension: "width" | "height" = width > height ? "width" : "height";
            thumbnailBuffer = await sharp(image)
                .resize({
                    [targetDimension]: thumbnailSize,
                    fit: "contain",
                })
                .toBuffer();
        }

        thumbnail = new Thumbnail();
        if ("width" in size) {
            const { width, height } = size;
            thumbnail.width = width;
            thumbnail.height = height;
            thumbnail.size = 0;
        } else {
            const { size: thumbnailSize } = size;
            thumbnail.width = 0;
            thumbnail.height = 0;
            thumbnail.size = thumbnailSize;
        }

        thumbnail.filesize = thumbnailBuffer.length;
        thumbnail.path = "";
        thumbnail.attachment = attachment;
        thumbnail = await this.save(thumbnail);

        if ("width" in size) {
            const { width, height } = size;

            thumbnail.path = path.join(this.thumbnailPath, `${thumbnail.id}.${width}x${height}.jpg`);
        } else {
            const { size: thumbnailSize } = size;

            thumbnail.path = path.join(this.thumbnailPath, `${thumbnail.id}.${thumbnailSize}.jpg`);
        }

        await fs.ensureDir(path.dirname(thumbnail.path));
        await fs.writeFile(thumbnail.path, thumbnailBuffer);

        return this.save(thumbnail);
    }
}
