import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DataSourceService } from "@data-source/data-source.service";
import { DataSource } from "@data-source/models/data-source.model";

@Module({
    imports: [TypeOrmModule.forFeature([DataSource])],
    providers: [DataSourceService],
    exports: [DataSourceService],
})
export class DataSourceModule {}
