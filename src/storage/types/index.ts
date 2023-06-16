import { LocalStorage } from "@storage/types/local";
import { S3Storage } from "@storage/types/s3";

export type StorageTypes = LocalStorage | S3Storage;
export type StorageOptions = StorageTypes["options"];

export const createStorage = (options: StorageOptions): StorageTypes => {
    const { type } = options;

    switch (type) {
        case "local":
            return new LocalStorage(options);

        case "s3":
            return new S3Storage(options);
    }
};
