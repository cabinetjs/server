import { BaseEntity, DeepPartial, Repository, FindOptionsWhere } from "typeorm";

export abstract class BaseService<TEntity extends BaseEntity, RawType extends DeepPartial<TEntity>> {
    protected constructor(
        protected readonly entity: typeof BaseEntity,
        protected readonly repository: Repository<TEntity>,
    ) {}

    public async find(where?: FindOptionsWhere<TEntity>): Promise<TEntity[]> {
        return this.repository.find({ where });
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
            return this.repository.save(rawData);
        } else {
            return this.repository.save(rawData);
        }
    }
}
