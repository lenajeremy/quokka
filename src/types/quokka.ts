import { QuokkaApiMutation, QuokkaApiQuery } from "../api";
import { UseFetchReturn } from "./fetch";

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

export type QueryHook<Takes, Returns, Error> = (
  args: Takes,
  options?: QueryHookOptions,
) => UseFetchReturn<Takes, Returns, Error>;

type HookSuffix<T> = T extends QuokkaApiQuery<any, any> ? "Query"
  : T extends QuokkaApiMutation<any, any> ? "Mutation"
  : never;

type HookFunction<T> = T extends QuokkaApiQuery<infer Takes, infer Returns>
  ? QueryHook<Takes, Returns, Error>
  : T extends QuokkaApiMutation<infer Takes, any>
  ? (val: Takes) => QuokkaApiMutationParams
  : never;

export type Hookify<T> = {
  [K in keyof T as `use${Capitalize<string & K>}${HookSuffix<T[K]>}`]:
  HookFunction<T[K]>;
};
