import fs from "fs-extra";

import { BaseStorage, BaseStorageOptions } from "@storage/types/base";
import { Attachment } from "@attachment/models/attachment.model";

import { Fetcher } from "@utils/fetcher";
import * as path from "path";

export interface LocalStorageOptions extends BaseStorageOptions<"local"> {
    path: string;
}

export interface LocalStorageData {
    path: string;
}

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
        const fileName = `${attachment.uid}${attachment.extension}`;
        const targetPath = path.join(this.path, fileName);

        await fs.writeFile(targetPath, buffer);

        return {
            path: targetPath,
        };
    }
}
