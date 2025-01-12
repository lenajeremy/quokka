import { CreateApiOptions, MakeHook } from "../types/quokka";
import { QuokkaApiMutation } from "./api-mutation";
import { QuokkaApiQuery } from "./api-query";
import { TagType } from "../types";
export declare class QuokkaApi<T, Tags> {
    private endpoints;
    readonly apiName: string;
    private readonly prepareHeaders?;
    private readonly baseUrl;
    readonly tags: TagType<Tags> | undefined;
    queries: Record<string, QuokkaApiQuery<any, any, any>>;
    mutations: Record<string, QuokkaApiMutation<any, any, any>>;
    private readonly builder;
    actions: MakeHook<T, Tags>;
    constructor(init: CreateApiOptions<T, Tags>);
    private processEndpoints;
}
