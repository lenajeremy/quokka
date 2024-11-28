import {QuokkaApiMutation} from "../models/api-mutation";
import {QuokkaApiQuery} from "../models/api-query"
import {UseFetchReturn} from "./fetch";
import {QuokkaRequestBuilder} from "../models/request-builder";
import {TagType} from "./index";

export type QuokkaApiQueryParams<TagString> = {
    url: string;
    params?: Record<string, any>;
    method?: "GET";
    headers?: Headers;
    providesTags?: TagType<TagString>;
};

export type QuokkaApiMutationParams<TagString> = {
    url: string;
    params?: Record<string, any>;
    method: "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
    body?: BodyInit | Record<string, any>;
    headers?: Headers;
    invalidatesTags?: TagType<TagString>;
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

export type QueryHook<Takes, Returns, Error> = (
    args: Takes,
    options?: QueryHookOptions,
) => UseFetchReturn<Takes, Returns, Error>;

export type MutationHook<Takes, Returns, Error> = (
    options?: MutationHookOptions,
) => UseFetchReturn<Takes, Returns, Error>;

type HookSuffix<T, Tags> = T extends QuokkaApiQuery<any, any, Tags> ? "Query"
    : T extends QuokkaApiMutation<any, any, Tags> ? "Mutation"
        : never;

type HookFunction<T, Tags> = T extends QuokkaApiQuery<infer Takes, infer Returns, Tags>
    ? QueryHook<Takes, Returns, Error>
    : T extends QuokkaApiMutation<infer Takes, infer Returns, Tags>
        ? MutationHook<Takes, Returns, Error>
        : never;

export type MakeHook<T, Tags> = {
    [K in keyof T as `use${Capitalize<string & K>}${HookSuffix<T[K], Tags>}`]:
    HookFunction<T[K], Tags>;
};

export type CreateApiOptions<Endpoints, Tags> = {
    apiName: string;
    baseUrl: string;
    prepareHeaders?: (getState: () => any, headers: Headers) => Headers;
    endpoints: (builder: QuokkaRequestBuilder<Tags>) => Endpoints;
    tags?: TagType<Tags>
};