import { MutationHookType, QueryHookType } from "./types";
import {
  Hookify,
  QueryHook,
  QuokkaApiMutationParams,
  QuokkaApiQueryParams,
} from "./types/quokka";
export declare abstract class QuokkaApiAction<
  ParameterGenerator,
  HookType extends string,
> {
  protected generateParams: ParameterGenerator;
  protected requestName: string;
  protected hasSetKey: boolean;
  nameOfHook: HookType | undefined;
  constructor(generateParams: ParameterGenerator);
  setKey(key: string): void;
  asHook(apiInit: Omit<CreateApiOptions<any>, "endpoints">): {
    [x: string]: unknown;
  };
  protected generateHookName(): HookType;
  protected generateHook(
    params: ParameterGenerator,
    apiInit: Omit<CreateApiOptions<any>, "endpoints">,
  ): unknown;
}
export declare class QuokkaApiQuery<Takes, Returns> extends QuokkaApiAction<
  (a: Takes) => QuokkaApiQueryParams,
  QueryHookType<string>
> {
  constructor(generateParams: (a: Takes) => QuokkaApiQueryParams);
  protected generateHookName(): QueryHookType<string>;
  protected generateHook(
    params: (a: Takes) => QuokkaApiQueryParams,
    apiInit: Omit<CreateApiOptions<any>, "endpoints">,
  ): QueryHook<Takes, Returns, Error>;
}
export declare class QuokkaApiMutation<Takes, Returns> extends QuokkaApiAction<
  (a: Takes) => QuokkaApiMutationParams,
  MutationHookType<string>
> {
  constructor(generateParams: (a: Takes) => QuokkaApiMutationParams);
  protected generateHookName(): MutationHookType<string>;
}
export declare class QuokkaRequestBuilder {
  query: <Takes, Returns>(
    val: (args: Takes) => QuokkaApiQueryParams,
  ) => QuokkaApiQuery<Takes, Returns>;
  mutation: <Takes, Returns>(
    val: (args: Takes) => QuokkaApiMutationParams,
  ) => QuokkaApiMutation<Takes, Returns>;
  constructor();
}
export type CreateApiOptions<Endpoints> = {
  apiName: string;
  baseUrl: string;
  prepareHeaders?: (globalState: any, headers: Headers) => Headers;
  endpoints: (builder: QuokkaRequestBuilder) => Endpoints;
};
export declare class QuokkaApi<T> {
  private endpoints;
  private apiName;
  private prepareHeaders?;
  private baseUrl;
  private builder;
  actions: Hookify<T>;
  constructor(init: CreateApiOptions<T>);
  processEndpoints(): void;
}
export declare function createApi<
  T extends Record<
    string,
    QuokkaApiQuery<any, any> | QuokkaApiMutation<any, any>
  >,
>(options: CreateApiOptions<T>): QuokkaApi<T>;
