import { Inject } from "@nestjs/common";
import { Query, ResolveField, Resolver, Root, Int } from "@nestjs/graphql";

import { DataSourceService } from "@data-source/data-source.service";

import { DataSourceModel } from "@data-source/models/data-source.model";

@Resolver(() => DataSourceModel)
export class DataSourceResolver {
    public constructor(@Inject(DataSourceService) private readonly dataSourceService: DataSourceService) {}

    @Query(() => [DataSourceModel])
    public async dataSources(): Promise<DataSourceModel[]> {
        return this.dataSourceService.getRegisteredDataSources();
    }

    @ResolveField(() => Int)
    public async postCount(@Root() dataSource: DataSourceModel) {
        return this.dataSourceService.getPostCount(dataSource.id);
    }

    @ResolveField(() => Int)
    public async mediaCount(@Root() dataSource: DataSourceModel) {
        return this.dataSourceService.getMediaCount(dataSource.id);
    }
}
