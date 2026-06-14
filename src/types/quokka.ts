import { QuokkaApiMutation } from "../models/api-mutation";
import { QuokkaApiQuery } from "../models/api-query";
import { UseFetchReturn } from "./fetch";
import { QuokkaRequestBuilder } from "../models/request-builder";
import { TagType } from "./index";

export type QuokkaApiQueryParams<TagString, Returns> = {
  url: string;
  params?: Record<string, any>;
  method?: "GET";
  headers?: Headers;
  providesTags?: TagType<TagString, Returns>;
};

export type QuokkaApiMutationParams<TagString, Returns> = {
  url: string;
  params?: Record<string, any>;
  method: "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
  body?: BodyInit | Record<string, any>;
  headers?: Headers;
  invalidatesTags?: TagType<TagString, Returns>;
};

export type QueryHookOptions = {
  fetchOnRender?: boolean;
  fetchOnArgsChange?: boolean;
  refetchOnFocus?: boolean;
  pollingInterval?: number;
  refetchOnConnection?: boolean;
  debouncedDuration?: number;
  ttl?: number;
};

export type MutationHookOptions<TagString, Returns> = {
  invalidates?: TagType<TagString, Returns>;
};

export type QueryHook<Takes, Returns, Error, TagString> = (
  args: Takes,
  options?: QueryHookOptions,
) => UseFetchReturn<Takes, Returns, Error>;

export type MutationHook<Takes, Returns, Error, TagString> = (
  options?: MutationHookOptions<TagString, Returns>,
) => UseFetchReturn<Takes, Returns, Error, MutationHookOptions<TagString, Returns>>;

type HookSuffix<T, Tags> =
  T extends QuokkaApiQuery<any, any, Tags>
    ? "Query"
    : T extends QuokkaApiMutation<any, any, Tags>
      ? "Mutation"
      : never;

type HookFunction<T, Tags> =
  T extends QuokkaApiQuery<infer Takes, infer Returns, Tags>
    ? QueryHook<Takes, Returns, Error, Tags>
    : T extends QuokkaApiMutation<infer Takes, infer Returns, Tags>
      ? MutationHook<Takes, Returns, Error, Tags>
      : never;

export type MakeHook<T, Tags> = {
  [K in keyof T as `use${Capitalize<string & K>}${HookSuffix<T[K], Tags>}`]: HookFunction<
    T[K],
    Tags
  >;
};

export type CreateApiOptions<Endpoints, Tags, RootState = any> = {
  apiName: string;
  baseUrl: string;
  prepareHeaders?: (
    getState: <T = RootState>() => T,
    headers: Headers,
  ) => Headers;
  endpoints: (builder: QuokkaRequestBuilder<Tags>) => Endpoints;
  tags?: Array<Tags>;
};
