import _ from "lodash";
import { BaseEntity, DeepPartial, FindOptionsWhere, In, Repository } from "typeorm";

export interface Entity extends BaseEntity {
    id: string;
}

export abstract class BaseService<TEntity extends Entity, RawType extends DeepPartial<TEntity>> {
    protected constructor(
        protected readonly entity: typeof BaseEntity,
        protected readonly repository: Repository<TEntity>,
    ) {}

    public async getIdMap(ids?: string[]): Promise<Record<string, TEntity>> {
        const entities = await this.repository.find({
            where: ids
                ? ({
                      id: In(ids),
                  } as FindOptionsWhere<TEntity>)
                : undefined,
        });

        return _.keyBy(entities, "id");
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
