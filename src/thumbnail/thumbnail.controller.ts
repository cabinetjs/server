import path from "path";
import type { Response } from "express";

import { Controller, Get, Inject, Param, Res } from "@nestjs/common";

import { ThumbnailService } from "@thumbnail/thumbnail.service";
import { AttachmentService } from "@attachment/attachment.service";

@Controller("thumbnails")
export class ThumbnailController {
    public constructor(
        @Inject(ThumbnailService) private readonly thumbnailService: ThumbnailService,
        @Inject(AttachmentService) private readonly attachmentService: AttachmentService,
    ) {}

    @Get("/:uid/:width/:height")
    public async thumbnail(
        @Param("uid") uid: string,
        @Param("width") width: number,
        @Param("height") height: number,
        @Res() response: Response,
    ) {
        const widthValue = Number(width);
        const heightValue = Number(height);
        if (isNaN(widthValue) || isNaN(heightValue)) {
            throw new Error("Invalid width or height");
        }

        const attachment = await this.attachmentService.findOne({
            where: { uid },
        });

        if (!attachment) {
            throw new Error("Attachment not found");
        }

        const thumbnail = await this.thumbnailService.ensure(attachment, { width: widthValue, height: heightValue });
        const fileName = path.basename(thumbnail.path);

        response.redirect(`/thumbnails/${fileName}`);
    }

    @Get("/:uid/:size")
    public async singularThumbnail(@Param("uid") uid: string, @Param("size") size: number, @Res() response: Response) {
        const sizeValue = Number(size);
        if (isNaN(sizeValue)) {
            throw new Error("Invalid size");
        }

        const attachment = await this.attachmentService.findOne({
            where: { uid },
        });

        if (!attachment) {
            throw new Error("Attachment not found");
        }

        const thumbnail = await this.thumbnailService.ensure(attachment, { size: sizeValue });
        const fileName = path.basename(thumbnail.path);

        response.redirect(`/thumbnails/${fileName}`);
    }
}
