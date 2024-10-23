import { MutationHookType, QueryHookType } from "../types";
import {
  Hookify,
  QuokkaApiMutationParams,
  QuokkaApiQueryParams,
} from "../types/quokka";

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

  asHook() {
    if (!this.hasSetKey) {
      throw new Error(
        "Should set key before attempting to generate mutation hook",
      );
    }
    return {
      [this.generateHook()]: this.generateParams,
    };
  }

  protected generateHook(): HookType {
    return "NOT IMPLEMENTED" as HookType;
  }
}

export class QuokkaApiQuery<Takes, Returns> extends QuokkaApiAction<
  (a: Takes) => QuokkaApiQueryParams,
  QueryHookType<string>
> {
  constructor(generateParams: (a: Takes) => QuokkaApiQueryParams) {
    super(generateParams);
  }

  protected generateHook(): QueryHookType<string> {
    const capitalized = (this.requestName.charAt(0).toUpperCase() +
      this.requestName.slice(1)) as Capitalize<string>;
    const hook = `use${capitalized}Query` as QueryHookType<string>;
    this.nameOfHook = hook;
    return hook;
  }
}

export class QuokkaApiMutation<Takes, Returns> extends QuokkaApiAction<
  (a: Takes) => QuokkaApiMutationParams,
  MutationHookType<string>
> {
  constructor(generateParams: (a: Takes) => QuokkaApiMutationParams) {
    super(generateParams);
  }

  protected generateHook(): MutationHookType<string> {
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
