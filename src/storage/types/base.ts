import { pascalCase } from "change-case";

import { Attachment } from "@attachment/models/attachment.model";

import { Logger } from "@utils/logger";

export interface BaseStorageOptions<Type extends string> {
    type: Type;
}

export abstract class BaseStorage<
    Type extends string,
    TOptions extends BaseStorageOptions<Type> = BaseStorageOptions<Type>,
    TData = any,
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

        return attachment;
    }
}
