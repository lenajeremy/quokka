import { MutationHookType, QueryHookType } from "../types";
import { Hookify, QuokkaApiMutationParams, QuokkaApiQueryParams } from "../types/quokka";
declare class QuokkaApiAction<ParameterGenerator, HookType extends string> {
    protected generateParams: ParameterGenerator;
    protected requestName: string;
    protected hasSetKey: boolean;
    nameOfHook: HookType | undefined;
    constructor(generateParams: ParameterGenerator);
    setKey(key: string): void;
    asHook(): {
        [x: string]: ParameterGenerator;
    };
    protected generateHook(): HookType;
}
export declare class QuokkaApiQuery<Takes, Returns> extends QuokkaApiAction<(a: Takes) => QuokkaApiQueryParams, QueryHookType<string>> {
    constructor(generateParams: (a: Takes) => QuokkaApiQueryParams);
    protected generateHook(): QueryHookType<string>;
}
export declare class QuokkaApiMutation<Takes, Returns> extends QuokkaApiAction<(a: Takes) => QuokkaApiMutationParams, MutationHookType<string>> {
    constructor(generateParams: (a: Takes) => QuokkaApiMutationParams);
    protected generateHook(): MutationHookType<string>;
}
declare class QuokkaRequestBuilder {
    query: <Takes, Returns>(val: (args: Takes) => QuokkaApiQueryParams) => QuokkaApiQuery<Takes, Returns>;
    mutation: <Takes, Returns>(val: (args: Takes) => QuokkaApiMutationParams) => QuokkaApiMutation<Takes, Returns>;
    constructor();
}
type CreateApiOptions<Endpoints> = {
    apiName: string;
    baseUrl: string;
    prepareHeaders?: (globalState: any, headers: Headers) => Headers;
    endpoints: (builder: QuokkaRequestBuilder) => Endpoints;
};
declare class QuokkaApi<T> {
    private endpoints;
    private apiName;
    private prepareHeaders?;
    private baseUrl;
    private builder;
    actions: Hookify<T>;
    constructor(init: CreateApiOptions<T>);
    processEndpoints(): void;
}
export declare function createApi<T extends Record<string, QuokkaApiQuery<any, any> | QuokkaApiMutation<any, any>>>(options: CreateApiOptions<T>): QuokkaApi<T>;
export {};
