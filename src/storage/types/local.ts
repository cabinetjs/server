import path from "path";
import fs from "fs-extra";
import { is } from "typia";
import sanitize from "sanitize-filename";

import { BaseData, BaseStorage, BaseStorageOptions } from "@storage/types/base";
import { Attachment } from "@attachment/models/attachment.model";

import { Fetcher } from "@utils/fetcher";

export interface LocalStorageOptions extends BaseStorageOptions<"local"> {
    path: string;
}

export interface LocalStorageData extends BaseData {
    path: string;
}

const getFileName = (attachment: Attachment) =>
    `${sanitize(attachment.uid, { replacement: "_" })}${attachment.extension}`;

export class LocalStorage extends BaseStorage<"local", LocalStorageOptions, LocalStorageData> {
    private readonly fetcher: Fetcher = new Fetcher();
    private path: string = this.options.path;

    public constructor(options: LocalStorageOptions) {
        super("local", options);
    }

    public async doInitialize(): Promise<void> {
        let targetPath = this.path;
        if (!path.isAbsolute(targetPath)) {
            targetPath = path.join(process.cwd(), targetPath);
        }

        if (fs.existsSync(targetPath)) {
            if (!fs.statSync(targetPath).isDirectory()) {
                throw new Error(`'${targetPath}' is not a directory`);
            }
        }

        await fs.ensureDir(targetPath);
        this.path = targetPath;
    }
    public async doStore(attachment: Attachment): Promise<LocalStorageData> {
        const buffer = await this.fetcher.download(attachment.url);
        const fileName = getFileName(attachment);
        const targetPath = path.join(this.path, fileName);

        await fs.writeFile(targetPath, buffer);

        return {
            path: targetPath,
            buffer,
        };
    }
    public async doCheckStored(attachment: Attachment): Promise<boolean> {
        if (!attachment.storageData) {
            return false;
        }

        const data = JSON.parse(attachment.storageData);
        if (!is<LocalStorageData>(data)) {
            return false;
        }

        const fileName = getFileName(attachment);
        const targetPath = path.join(this.path, fileName);
        if (data.path !== targetPath) {
            return false;
        }

        return fs.existsSync(targetPath);
    }

    public async pull(attachment: Attachment): Promise<Buffer> {
        if (!attachment.storageData) {
            throw new Error("Attachment is not stored");
        }

        const data = JSON.parse(attachment.storageData);
        if (!is<LocalStorageData>(data)) {
            throw new Error("Stored data is invalid");
        }

        if (!fs.existsSync(data.path)) {
            throw new Error("File does not exist");
        }

        return fs.readFile(data.path);
    }
}
