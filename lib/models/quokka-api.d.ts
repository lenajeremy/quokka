import { CreateApiOptions, MakeHook } from "../types/quokka";
export declare class QuokkaApi<T> {
    private endpoints;
    private readonly apiName;
    private readonly prepareHeaders?;
    private readonly baseUrl;
    private readonly builder;
    actions: MakeHook<T>;
    constructor(init: CreateApiOptions<T>);
    private processEndpoints;
}
