import pluralize from "pluralize";
import { camelCase } from "change-case";

import { Args, Query, Resolver } from "@nestjs/graphql";
import { SelectManyArgs } from "@common/select-many.dto";
import { BaseService, Entity } from "@common/base.service";

export function createBaseResolver<T extends Entity>(entityClass: new () => T) {
    @Resolver({ isAbstract: true })
    abstract class BaseResolver {
        protected constructor(public readonly baseService: BaseService<T>) {}

        @Query(() => entityClass, { name: camelCase(entityClass.name), nullable: true })
        public async selectOne(@Args("id") id: string): Promise<T | null> {
            return this.baseService.selectOne(id);
        }

        @Query(() => [entityClass], { name: camelCase(pluralize(entityClass.name)) })
        public async selectMany(@Args() data: SelectManyArgs): Promise<T[]> {
            return this.baseService.selectMany(data);
        }
    }

    return BaseResolver;
}
