import React from "react";
import { MutationHookType, QueryHookType } from "./types";
import {
  Hookify,
  QueryHook,
  QueryHookOptions,
  QuokkaApiMutationParams,
  QuokkaApiQueryParams,
} from "./types/quokka";
import { UseFetchReturn } from "./types/fetch";
import { debounce, resolveRequestParameters } from "./utils";

export abstract class QuokkaApiAction<
  ParameterGenerator,
  HookType extends string,
> {
  protected generateParams: ParameterGenerator;
  protected requestName = "";
  protected hasSetKey = false;
  nameOfHook: HookType | undefined;

  constructor(generateParams: ParameterGenerator) {
    this.generateParams = generateParams;
  }

  setKey(key: string) {
    if (!this.hasSetKey) {
      this.requestName = key;
      this.hasSetKey = true;
    }
  }

  asHook(apiInit: {
    baseUrl: string;
    apiName: string;
  }) {
    if (!this.hasSetKey) {
      throw new Error(
        "Should set key before attempting to generate mutation hook",
      );
    }
    return {
      [this.generateHookName()]: this.generateHook(
        this.generateParams,
        apiInit,
      ),
    };
  }

  protected generateHookName(): HookType {
    return "NOT IMPLEMENTED" as HookType;
  }

  protected generateHook(
    params: ParameterGenerator,
    apiInit: Omit<CreateApiOptions<any>, "endpoints">,
  ): unknown {
    return "NOT IMPLEMENTED";
  }
}

export class QuokkaApiQuery<Takes, Returns> extends QuokkaApiAction<
  (a: Takes) => QuokkaApiQueryParams,
  QueryHookType<string>
> {
  constructor(generateParams: (a: Takes) => QuokkaApiQueryParams) {
    super(generateParams);
  }

  protected generateHookName(): QueryHookType<string> {
    const capitalized = (this.requestName.charAt(0).toUpperCase() +
      this.requestName.slice(1)) as Capitalize<string>;
    const hook = `use${capitalized}Query` as QueryHookType<string>;
    this.nameOfHook = hook;
    return hook;
  }

  protected generateHook(
    params: (a: Takes) => QuokkaApiQueryParams,
    apiInit: Omit<CreateApiOptions<any>, "endpoints">,
  ): QueryHook<Takes, Returns, Error> {
    function useQuery(
      args: Takes,
      options?: QueryHookOptions,
    ): UseFetchReturn<Takes, Returns, Error> {
      const initRef = React.useRef(params(args));
      const hasRunFetchRef = React.useRef(false);
      const hasArgsChangedRef = React.useRef(false);
      const isInitialRenderRef = React.useRef(true);

      const [data, setData] = React.useState<Returns | undefined>();
      const [error, setError] = React.useState<Error | undefined>();
      const [loading, setLoading] = React.useState(false);

      const trigger = React.useCallback(
        async function (data: Takes): Promise<Returns | null> {
          const requestParams = resolveRequestParameters(
            apiInit,
            initRef.current,
          );
          try {
            setLoading(true);
            setData(undefined);
            setError(undefined);

            const res = await fetch(requestParams.url, {
              method: requestParams.method,
              headers: requestParams.headers,
            });
            const json = await res.json();

            if (res.ok) {
              setData(json);
              return json;
            } else {
              throw json;
            }
          } catch (err) {
            setError(err as Error);
            throw err;
          } finally {
            setLoading(false);
          }
        },
        [],
      );

      const debouncedTrigger = React.useMemo(
        () => debounce(trigger, options?.debouncedDuration || 0),
        [trigger, options?.debouncedDuration],
      );

      React.useEffect(() => {
        if (isInitialRenderRef.current) {
          isInitialRenderRef.current = false;
          hasArgsChangedRef.current = false;
        } else {
          hasArgsChangedRef.current =
            JSON.stringify(initRef.current) !== JSON.stringify(params(args));
        }

        initRef.current = params(args);

        if (
          (options?.fetchOnRender && !hasRunFetchRef.current) ||
          (options?.fetchOnArgsChange && hasArgsChangedRef.current)
        ) {
          debouncedTrigger(init?.body as TArgs);
          hasRunFetchRef.current = true;
        }
      }, [options, input, init, debouncedTrigger, args]);

      return { data, trigger, error, loading };
    }
    return useQuery;
  }
}

export class QuokkaApiMutation<Takes, Returns> extends QuokkaApiAction<
  (a: Takes) => QuokkaApiMutationParams,
  MutationHookType<string>
> {
  constructor(generateParams: (a: Takes) => QuokkaApiMutationParams) {
    super(generateParams);
  }

  protected generateHookName(): MutationHookType<string> {
    const capitalized = this.requestName.charAt(0).toUpperCase() +
      this.requestName.slice(1) as Capitalize<string>;
    const hook = `use${capitalized}Mutation` as MutationHookType<string>;
    this.nameOfHook = hook;
    return hook;
  }
}

export class QuokkaRequestBuilder {
  query: <Takes, Returns>(
    val: (args: Takes) => QuokkaApiQueryParams,
  ) => QuokkaApiQuery<Takes, Returns>;
  mutation: <Takes, Returns>(
    val: (args: Takes) => QuokkaApiMutationParams,
  ) => QuokkaApiMutation<Takes, Returns>;

  constructor() {
    this.query = function <T, R>(val: (a: T) => QuokkaApiQueryParams) {
      const newQuery = new QuokkaApiQuery<T, R>(val);
      return newQuery;
    };

    this.mutation = function <T, R>(val: (a: T) => QuokkaApiMutationParams) {
      const newMutation = new QuokkaApiMutation<T, R>(val);
      return newMutation;
    };
  }
}

export type CreateApiOptions<
  Endpoints,
> = {
  apiName: string;
  baseUrl: string;
  prepareHeaders?: (globalState: any, headers: Headers) => Headers;
  endpoints: (builder: QuokkaRequestBuilder) => Endpoints;
};

export class QuokkaApi<T> {
  private endpoints: T;
  private apiName: string;
  private prepareHeaders?: (globalState: any, headers: Headers) => Headers;
  private baseUrl: string;

  private builder: QuokkaRequestBuilder;
  actions: Hookify<T>;

  constructor(init: CreateApiOptions<T>) {
    this.builder = new QuokkaRequestBuilder();
    this.endpoints = init.endpoints(this.builder);
    this.apiName = init.apiName;
    this.prepareHeaders = init.prepareHeaders;
    this.baseUrl = init.baseUrl;
    this.actions = {} as Hookify<T>;
  }

  processEndpoints() {
    const d = Object.entries(
      this.endpoints as Record<
        string,
        QuokkaApiQuery<any, any> | QuokkaApiMutation<any, any>
      >,
    ).reduce((acc, [key, mutationOrQuery]) => {
      mutationOrQuery.setKey(key);
      const hook = mutationOrQuery.asHook();
      acc = { ...acc, ...hook };
      return acc;
    }, {}) as typeof this.actions;

    this.actions = d;
  }
}

export function createApi<
  T extends Record<
    string,
    QuokkaApiQuery<any, any> | QuokkaApiMutation<any, any>
  >,
>(options: CreateApiOptions<T>): QuokkaApi<T> {
  const api = new QuokkaApi(options);

  return api;
}
