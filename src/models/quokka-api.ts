import {CreateApiOptions, MakeHook} from "../types/quokka";
import {QuokkaRequestBuilder} from "./request-builder";
import {QuokkaApiMutation} from "./api-mutation";
import {QuokkaApiQuery} from "./api-query";
import {TagType} from "../types";

export class QuokkaApi<T, Tags> {
    private endpoints: T;
    readonly apiName: string;
    private readonly prepareHeaders?: (getState: <T>() => T, headers: Headers) => Headers;
    private readonly baseUrl: string;
    readonly tags: TagType<Tags> | undefined;
    public queries: Record<string, QuokkaApiQuery<any, any, any>>
    public mutations: Record<string, QuokkaApiMutation<any, any, any>>;

    private readonly builder: QuokkaRequestBuilder<Tags>;
    actions: MakeHook<T, Tags>;

    constructor(init: CreateApiOptions<T, Tags>) {
        this.builder = new QuokkaRequestBuilder(this);
        this.endpoints = init.endpoints(this.builder);
        this.apiName = init.apiName;
        this.prepareHeaders = init.prepareHeaders;
        this.baseUrl = init.baseUrl;
        this.actions = {} as MakeHook<T, Tags>;
        this.tags = init.tags;
        this.queries = {}
        this.mutations = {}

        this.processEndpoints();
    }

    private processEndpoints() {
        this.actions = Object.entries(
            this.endpoints as Record<
                string,
                QuokkaApiQuery<any, any, Tags> | QuokkaApiMutation<any, any, Tags>
            >,
        ).reduce((acc, [key, mutationOrQuery]) => {
            mutationOrQuery.setKey(key);
            if (mutationOrQuery instanceof QuokkaApiQuery) {
                this.queries[key] = mutationOrQuery;
            } else {
                this.mutations[key] = mutationOrQuery;
            }

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
