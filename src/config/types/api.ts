export interface GraphQLApiOptions {
    type: "graphql";
    port: number;
    endpoint?: string;
    playground?: boolean;
}

export type ApiOptions = GraphQLApiOptions;
