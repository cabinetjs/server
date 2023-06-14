export type Fn<TArgs, TReturn> = TArgs extends never
    ? () => TReturn
    : TArgs extends any[]
    ? (...args: TArgs) => TReturn
    : (arg: TArgs) => TReturn;

export type StringKeyOf<T> = Exclude<keyof T, symbol | number>;

export interface Article {
    id: number;
    title?: string;
    content: string;
    comments: Comment[];
}

export interface Comment {
    id: number;
    content: string;
}
