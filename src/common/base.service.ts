import _ from "lodash";
import { BaseEntity, DeepPartial, FindOptionsWhere, In, Repository, FindManyOptions, FindOneOptions } from "typeorm";

import { SelectManyArgs } from "@common/select-many.dto";

export interface Entity extends BaseEntity {
    id: string;
}

export abstract class BaseService<TEntity extends Entity, RawType extends DeepPartial<TEntity> = any> {
    protected constructor(
        protected readonly entity: typeof BaseEntity,
        protected readonly repository: Repository<TEntity>,
    ) {}

    public async getIdMap(ids?: ReadonlyArray<TEntity["id"]>): Promise<Record<string, TEntity>> {
        const entities = await this.repository.find({
            where: ids
                ? ({
                      id: In(ids),
                  } as FindOptionsWhere<TEntity>)
                : undefined,
        });

        return _.keyBy(entities, "id");
    }

    public async findByIds(ids: ReadonlyArray<TEntity["id"]>, nullable = false): Promise<TEntity[]> {
        const entities = await this.getIdMap(ids);

        return ids.map(id => {
            const entity = entities[id];
            if (!nullable && !entity) {
                throw new Error(`${this.entity.name} entity with id '${id}' not found`);
            }

            return entity || null;
        });
    }
    public async find(options?: FindManyOptions<TEntity>): Promise<TEntity[]> {
        return this.repository.find(options);
    }
    public async findOne(options: FindOneOptions<TEntity>): Promise<TEntity | null> {
        return this.repository.findOne(options);
    }

    public async selectMany({ skip, take }: SelectManyArgs) {
        return this.repository.find({
            skip,
            take,
        });
    }

    public async count(where: FindOptionsWhere<TEntity>) {
        return this.repository.count({ where });
    }

    public create(): TEntity;
    public create(rawData: DeepPartial<TEntity>): TEntity;
    public create(rawData: DeepPartial<TEntity>[]): TEntity[];
    public create(rawData?: DeepPartial<TEntity> | DeepPartial<TEntity>[]): TEntity | TEntity[] {
        if (Array.isArray(rawData)) {
            return this.repository.create(rawData);
        } else if (rawData) {
            return this.repository.create(rawData);
        } else {
            return this.repository.create();
        }
    }

    public async save(rawData: DeepPartial<TEntity>): Promise<TEntity>;
    public async save(rawData: DeepPartial<TEntity>[]): Promise<TEntity[]>;
    public async save(rawData: DeepPartial<TEntity> | DeepPartial<TEntity>[]): Promise<TEntity | TEntity[]> {
        if (Array.isArray(rawData)) {
            if (rawData.length > 500) {
                const results: TEntity[] = [];
                const chunks = _.chunk(rawData, 500);
                for (const chunk of chunks) {
                    const data = await this.repository.save(chunk);
                    results.push(...data);
                }

                return results;
            }

            return this.repository.save(rawData);
        } else {
            return this.repository.save(rawData);
        }
    }
}
