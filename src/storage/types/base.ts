import { pascalCase } from "change-case";

import { Attachment } from "@attachment/models/attachment.model";

import { Logger } from "@utils/logger";
import { fromBuffer } from "file-type";

export interface BaseStorageOptions<Type extends string> {
    type: Type;
}

export interface BaseData {
    buffer?: Buffer;
}

export abstract class BaseStorage<
    Type extends string,
    TOptions extends BaseStorageOptions<Type> = BaseStorageOptions<Type>,
    TData extends BaseData = any,
> {
    protected readonly type: Type;
    protected readonly storageName: string;
    protected readonly options: TOptions;
    protected readonly logger: Logger;

    protected constructor(type: Type, options: TOptions) {
        this.type = type;
        this.options = options;
        this.storageName = pascalCase(`${type}-storage`);
        this.logger = new Logger(this.storageName);
    }

    protected abstract doInitialize(): Promise<void>;
    protected abstract doStore(attachment: Attachment): Promise<TData>;
    protected abstract doCheckStored(attachment: Attachment): Promise<boolean>;

    public async initialize(): Promise<void> {
        return this.logger.doWork({
            level: "log",
            message: `Initializing storage {cyan}`,
            args: [`'${this.type}'`],
            work: () => this.doInitialize(),
        });
    }

    public async store(attachment: Attachment): Promise<Attachment> {
        const data = await this.doStore(attachment);
        attachment.isStored = true;
        attachment.storageData = JSON.stringify(data);
        attachment.storedAt = new Date();

        if (data.buffer) {
            const { buffer } = data;
            attachment.size ||= buffer.length;

            const fileType = await fromBuffer(buffer);
            if (fileType) {
                attachment.extension ||= fileType.ext;
                attachment.mimeType ||= fileType.mime;
            }
        }

        return attachment;
    }

    public abstract pull(attachment: Attachment): Promise<Buffer>;

    public async checkStored(attachment: Attachment): Promise<boolean> {
        if (!attachment.isStored) {
            return false;
        }

        return this.doCheckStored(attachment);
    }
}
