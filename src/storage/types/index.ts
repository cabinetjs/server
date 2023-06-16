import { BaseStorage, BaseStorageOptions } from "@storage/types/base";
import { LocalStorage } from "@storage/types/local";

export type StorageTypes = LocalStorage;
export type StorageOptions = StorageTypes["options"];

export type DataSourceFactoryMap = {
    [TKey in StorageTypes["type"]]: (
        options: Extract<StorageOptions, BaseStorageOptions<TKey>>,
    ) => Extract<StorageTypes, BaseStorage<TKey>>;
};

export const AVAILABLE_DATA_SOURCES: DataSourceFactoryMap = {
    local: options => new LocalStorage(options),
};

export const createStorage = (options: StorageOptions): StorageTypes => {
    const { type } = options;

    return AVAILABLE_DATA_SOURCES[type](options);
};
