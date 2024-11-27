import {CreateApiOptions, MakeHook} from "../types/quokka";
import {QuokkaRequestBuilder} from "./request-builder";
import {QuokkaApiMutation} from "./api-mutation";
import {QuokkaApiQuery} from "./api-query";

export class QuokkaApi<T> {
    private endpoints: T;
    private readonly apiName: string;
    private readonly prepareHeaders?: (getState: <T>() => T, headers: Headers) => Headers;
    private readonly baseUrl: string;

    private readonly builder: QuokkaRequestBuilder;
    actions: MakeHook<T>;

    constructor(init: CreateApiOptions<T>) {
        this.builder = new QuokkaRequestBuilder();
        this.endpoints = init.endpoints(this.builder);
        this.apiName = init.apiName;
        this.prepareHeaders = init.prepareHeaders;
        this.baseUrl = init.baseUrl;
        this.actions = {} as MakeHook<T>;

        this.processEndpoints();
    }

    private processEndpoints() {
        this.actions = Object.entries(
            this.endpoints as Record<
                string,
                QuokkaApiQuery<any, any> | QuokkaApiMutation<any, any>
            >,
        ).reduce((acc, [key, mutationOrQuery]) => {
            mutationOrQuery.setKey(key);
            const hook = mutationOrQuery.asHook({
                baseUrl: this.baseUrl,
                apiName: this.apiName,
                prepareHeaders: this.prepareHeaders,
            });
            acc = {...acc, ...hook};
            return acc;
        }, {}) as typeof this.actions;
    }
}
