import _ from "lodash";
import { filesize } from "filesize";
import async, { ErrorCallback } from "async";

import { Inject, Injectable, OnApplicationBootstrap } from "@nestjs/common";

import { AttachmentService } from "@attachment/attachment.service";
import { Attachment } from "@attachment/models/attachment.model";

import { Config } from "@config/config.module";
import { InjectConfig } from "@config/config.decorator";

import { createStorage } from "@storage/types";
import { BaseStorage } from "@storage/types/base";

import { Logger } from "@utils/logger";

@Injectable()
export class StorageService implements OnApplicationBootstrap {
    private readonly config: Config;
    private readonly logger = new Logger(StorageService.name);
    private readonly queue: async.QueueObject<Attachment>;
    private storageObject: BaseStorage<string> | null = null;

    private get storage() {
        if (!this.storageObject) {
            throw new Error("Storage is not initialized");
        }

        return this.storageObject;
    }

    public constructor(
        @InjectConfig() config: Config,
        @Inject(AttachmentService) private readonly attachmentService: AttachmentService,
    ) {
        this.config = config;
        this.queue = async.queue(this.drainQueue.bind(this), config.storingConcurrency ?? 1);
    }

    public async onApplicationBootstrap() {
        this.storageObject = createStorage(this.config.storage);
        await this.storageObject.initialize();

        this.logger.log(`Storage initialized with concurrency {cyan}.`, undefined, this.config.storingConcurrency ?? 1);
    }

    public async store(targetAttachments: ReadonlyArray<Attachment>) {
        const attachments: Attachment[] = [];
        for (const attachment of targetAttachments) {
            const isStored = await this.storage.checkStored(attachment);
            if (!isStored) {
                attachments.push(attachment);
            }
        }

        if (attachments.length === 0) {
            return [];
        }

        await this.queue.push([...attachments]);
        this.queue.drain().then();

        const totalSize = _.sumBy(attachments, "size");
        this.logger.log(
            `Queued {cyan} attachments items to store {gray}`,
            undefined,
            attachments.length,
            `(${filesize(totalSize)})`,
        );
    }

    private drainQueue(attachment: Attachment, callback: ErrorCallback) {
        if (attachment.isStored) {
            return;
        }

        (async () => {
            try {
                const data = await this.storage.store(attachment);
                await this.attachmentService.save(data);

                this.logger.log(
                    "{yellow} Successfully stored attachment: {cyan} {gray}",
                    undefined,
                    `[${this.queue.length()}]`,
                    `'${data.name}${data.extension}'`,
                    `(${filesize(data.size)})`,
                );
            } catch (e) {
                this.logger.error(
                    "Failed to store attachment {cyan}",
                    undefined,
                    undefined,
                    `'${attachment.name}${attachment.extension}'`,
                );

                throw e;
            }

            callback();
        })();
    }
}
