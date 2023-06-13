export type Fn<TArgs, TReturn> = TArgs extends never
    ? () => TReturn
    : TArgs extends any[]
    ? (...args: TArgs) => TReturn
    : (arg: TArgs) => TReturn;
