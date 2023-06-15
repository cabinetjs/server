import { BaseDataSource, BaseDataSourceOption } from "@data-source/types/base";
import { ImageBoardDataSource } from "@data-source/types/image-board";

export type DataSourceTypes = ImageBoardDataSource;
export type DataSourceOptions = DataSourceTypes["options"];

export type DataSourceFactoryMap = {
    [TKey in DataSourceTypes["type"]]: (
        options: Extract<DataSourceOptions, BaseDataSourceOption<TKey>>,
    ) => Extract<DataSourceTypes, BaseDataSource<TKey>>;
};

export const AVAILABLE_DATA_SOURCES: DataSourceFactoryMap = {
    ImageBoard: options => new ImageBoardDataSource(options),
};

export const createDataSource = (options: DataSourceOptions): DataSourceTypes => {
    const { type } = options;

    return AVAILABLE_DATA_SOURCES[type](options);
};
