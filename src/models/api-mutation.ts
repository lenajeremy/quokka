import React from "react";
import {QuokkaApiAction} from "./api-action";
import {CreateApiOptions, MutationHook, QuokkaApiMutationParams} from "../types/quokka";
import {MutationHookType, TagType} from "../types";
import {debounce, hasMatchingTags, resolveRequestParameters} from "../utils";
import {useQuokkaContext} from "../context";
import {QuokkaApi} from "./quokka-api";
import {CacheManager} from "../cache";

export class QuokkaApiMutation<Takes, Returns, TagString> extends QuokkaApiAction<
    (a: Takes) => QuokkaApiMutationParams<TagString>,
    MutationHookType,
    MutationHook<Takes, Returns, Error>
> {
    tags?: TagType<TagString>

    constructor(generateParams: (a: Takes) => QuokkaApiMutationParams<TagString>, api: QuokkaApi<any, any>, options?: {
        invalidatesTags?: TagType<TagString>
    }) {
        super(generateParams, api);
        this.tags = options?.invalidatesTags;
    }

    protected generateHookName(): MutationHookType {
        const capitalized = this.requestName.charAt(0).toUpperCase() +
        this.requestName.slice(1) as Capitalize<string>;
        const hook = `use${capitalized}Mutation` as MutationHookType;
        this.nameOfHook = hook;
        return hook;
    }

    protected generateHook(
        params: (a: Takes) => QuokkaApiMutationParams<TagString>,
        apiInit: Omit<CreateApiOptions<any, TagString>, "endpoints">,
    ) {
        const mutationThis = this
        const useMutation: MutationHook<Takes, Returns, Error> = (
            options,
        ) => {
            const [data, setData] = React.useState<Returns | undefined>();
            const [error, setError] = React.useState<Error | undefined>();
            const [loading, setLoading] = React.useState(false);
            const {getState, cacheManager} = useQuokkaContext()

            const trigger = React.useCallback(
                async function (data: Takes): Promise<Returns | undefined> {
                    const requestParams = resolveRequestParameters(
                        apiInit,
                        params(data),
                        getState!
                    );

                    // const key = await generateRequestKey(requestParams)
                    let err = null;

                    try {
                        setLoading(true);
                        setData(undefined);
                        setError(undefined);

                        const res = await fetch(requestParams.url, {
                            method: requestParams.method,
                            headers: requestParams.headers,
                            body: requestParams.body instanceof FormData
                                ? requestParams.body
                                : JSON.stringify(requestParams.body),
                        });
                        console.log('await response')
                        const json = await res.json();

                        if (res.ok) {
                            if (cacheManager) {
                                mutationThis.invalidateCache(cacheManager)
                            }
                            setData(json);
                            return json;
                        } else {
                            err = json
                        }
                    } catch (err) {
                        setError(err as Error);
                        throw err;
                    } finally {
                        setLoading(false);
                    }

                    if (err) {
                        throw err
                    }
                },
                [],
            );

            return {data, trigger, error, loading};
        };

        return useMutation;
    }

    protected invalidateCache(cacheManager: CacheManager) {
        if (!this.tags) return
        const r = /^use(\w+)Query$/

        for (let cacheEntry of Object.values(cacheManager.apis[this.api.apiName])) {
            if (hasMatchingTags(this.tags, cacheEntry.tags)) {
                const match = cacheEntry.name.match(r)
                if (match) {
                    const key = match[1].charAt(0).toLowerCase() + match[1].substring(1)
                    this.api.queries[key].trigger!(cacheEntry.payload)
                }
            }
        }
    }
}

