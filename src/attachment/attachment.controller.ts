import type { Response } from "express";
import { fromBuffer } from "file-type";

import { Controller, Get, Inject, Param, Res } from "@nestjs/common";

import { AttachmentService } from "@attachment/attachment.service";
import { StorageService } from "@storage/storage.service";

@Controller("attachments")
export class AttachmentController {
    public constructor(
        @Inject(AttachmentService) private readonly attachmentService: AttachmentService,
        @Inject(StorageService) private readonly storageService: StorageService,
    ) {}

    @Get("/:id")
    public async getAttachment(@Param("id") id: string, @Res() res: Response) {
        const attachment = await this.attachmentService.findOne({ where: { id } });
        if (!attachment) {
            return res.status(404).end();
        }

        const buffer = await this.storageService.pull(attachment);
        const fileType = await fromBuffer(buffer);
        if (!fileType) {
            throw new Error("Failed to determine file type");
        }

        res.setHeader("Content-Type", fileType.mime);
        res.setHeader("Content-Length", buffer.length);
        res.setHeader("Content-Disposition", `attachment; filename="${attachment.name}.${fileType.ext}"`);
        res.end(buffer);
    }
}
