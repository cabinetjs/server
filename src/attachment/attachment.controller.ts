import type { Response } from "express";
import { fromBuffer } from "file-type";
import { Readable } from "stream";

import { Controller, Get, Inject, Param, Res, Headers, HttpStatus } from "@nestjs/common";

import { AttachmentService } from "@attachment/attachment.service";
import { StorageService } from "@storage/storage.service";

@Controller("attachments")
export class AttachmentController {
    public constructor(
        @Inject(AttachmentService) private readonly attachmentService: AttachmentService,
        @Inject(StorageService) private readonly storageService: StorageService,
    ) {}

    @Get("/:id")
    public async getAttachment(@Param("id") id: string, @Headers() headers, @Res() res: Response) {
        const attachment = await this.attachmentService.findOne({ where: { id } });
        if (!attachment) {
            return res.status(404).end();
        }

        const buffer = await this.storageService.pull(attachment);
        const fileType = await fromBuffer(buffer);
        if (!fileType) {
            throw new Error("Failed to determine file type");
        }

        if (fileType.mime.startsWith("video/")) {
            const stream = Readable.from(buffer, { highWaterMark: 1024 * 1024 * 10 });
            const videoRange = headers.range;
            if (!videoRange) {
                res.setHeader("Content-Length", buffer.length);
                stream.pipe(res);
            } else {
                const parts = videoRange.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : buffer.length - 1;
                const chunkSize = end - start + 1;
                const head = {
                    "Content-Range": `bytes ${start}-${end}/${buffer.length}`,
                    "Content-Length": chunkSize,
                };

                res.writeHead(HttpStatus.PARTIAL_CONTENT, head); //206
                stream.pipe(res);
            }

            return;
        }

        res.setHeader("Content-Type", fileType.mime);
        res.setHeader("Content-Length", buffer.length);
        res.setHeader("Content-Disposition", `attachment; filename="${attachment.uid}.${fileType.ext}"`);
        res.end(buffer);
    }
}
