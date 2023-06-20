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

    public async fromAttachment(attachment: Attachment, width: number, height: number): Promise<Thumbnail | null> {
        const item = await this.thumbnailRepository
            .createQueryBuilder("t")
            .select("t.id", "id")
            .where("t.attachmentId = :attachmentId", { attachmentId: attachment.id })
            .andWhere("t.width = :width", { width })
            .andWhere("t.height = :height", { height })
            .getRawOne<{ id: string }>();

        if (!item) {
            return null;
        }

        return this.findOne({
            where: { id: item.id },
        });
    }

    public async ensure(attachment: Attachment, width: number, height: number): Promise<Thumbnail> {
        let thumbnail = await this.fromAttachment(attachment, width, height);
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

        const thumbnailBuffer = await sharp(image)
            .resize({
                width,
                height,
                fit: "cover",
            })
            .toBuffer();

        thumbnail = new Thumbnail();
        thumbnail.width = width;
        thumbnail.height = height;
        thumbnail.size = thumbnailBuffer.length;
        thumbnail.path = "";
        thumbnail.attachment = attachment;
        thumbnail = await this.save(thumbnail);

        thumbnail.path = path.join(this.thumbnailPath, `${thumbnail.id}.jpg`);

        await fs.ensureDir(path.dirname(thumbnail.path));
        await fs.writeFile(thumbnail.path, thumbnailBuffer);

        return this.save(thumbnail);
    }
}
