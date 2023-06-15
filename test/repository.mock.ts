import { Repository } from "typeorm";

export type MockType<T> = {
    [P in keyof T]?: jest.Mock<Record<string, never>>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
    findOne: jest.fn(entity => entity),
    // ...
}));
