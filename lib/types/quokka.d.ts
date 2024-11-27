import { QuokkaApiMutation } from "../models/api-mutation";
import { QuokkaApiQuery } from "../models/api-query";
import { UseFetchReturn } from "./fetch";
import { QuokkaRequestBuilder } from "../models/request-builder";
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
    body?: BodyInit | Record<string, any>;
    headers?: Headers;
};
export type QueryHookOptions = {
    fetchOnRender?: boolean;
    fetchOnArgsChange?: boolean;
    debouncedDuration?: number;
};
export type MutationHookOptions = {
    invalidates?: string[] | string;
    debouncedDuration?: number;
};
export type QueryHook<Takes, Returns, Error> = (args: Takes, options?: QueryHookOptions) => UseFetchReturn<Takes, Returns, Error>;
export type MutationHook<Takes, Returns, Error> = (options?: MutationHookOptions) => UseFetchReturn<Takes, Returns, Error>;
type HookSuffix<T> = T extends QuokkaApiQuery<any, any> ? "Query" : T extends QuokkaApiMutation<any, any> ? "Mutation" : never;
type HookFunction<T> = T extends QuokkaApiQuery<infer Takes, infer Returns> ? QueryHook<Takes, Returns, Error> : T extends QuokkaApiMutation<infer Takes, infer Returns> ? MutationHook<Takes, Returns, Error> : never;
export type MakeHook<T> = {
    [K in keyof T as `use${Capitalize<string & K>}${HookSuffix<T[K]>}`]: HookFunction<T[K]>;
};
export type CreateApiOptions<Endpoints> = {
    apiName: string;
    baseUrl: string;
    prepareHeaders?: (globalState: any, headers: Headers) => Headers;
    endpoints: (builder: QuokkaRequestBuilder) => Endpoints;
};
export {};
