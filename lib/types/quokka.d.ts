import { QuokkaApiQuery, QuokkaApiMutation } from "../src/api";
export type QuokkaApiQueryParams = {
    url: string;
    params?: Record<string, any>;
    method?: "GET";
    headers?: Headers;
};
export type QuokkaApiMutationParams = {
    url: string;
    params?: Record<string, any>;
    method: "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
    body: BodyInit | Record<string, any>;
};
type HookSuffix<T> = T extends QuokkaApiQuery<any, any> ? "Query" : T extends QuokkaApiMutation<any, any> ? "Mutation" : never;
type HookFunction<T> = T extends QuokkaApiQuery<infer Takes, any> ? (val: Takes) => QuokkaApiQueryParams : T extends QuokkaApiMutation<infer Takes, any> ? (val: Takes) => QuokkaApiMutationParams : never;
export type Hookify<T> = {
    [K in keyof T as `use${Capitalize<string & K>}${HookSuffix<T[K]>}`]: HookFunction<T[K]>;
};
export {};
