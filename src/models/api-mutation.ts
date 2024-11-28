import React from "react";
import {QuokkaApiAction} from "./api-action";
import {MutationHook, QuokkaApiMutationParams} from "../types/quokka";
import {MutationHookType, TagType} from "../types";
import {debounce, resolveRequestParameters} from "../utils";
import {CreateApiOptions} from "../types/quokka";
import {getCacheManager, useQuokkaContext} from "../context";
import {QuokkaApi} from "./quokka-api";

export class QuokkaApiMutation<Takes, Returns, TagString> extends QuokkaApiAction<
    (a: Takes) => QuokkaApiMutationParams<TagString>,
    MutationHookType,
    MutationHook<Takes, Returns, Error>
> {
    tags?: TagType<TagString>

    constructor(generateParams: (a: Takes) => QuokkaApiMutationParams<TagString>, api: QuokkaApi<any, any>) {
        super(generateParams, api);
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
        // const queryThis = this
        const useMutation: MutationHook<Takes, Returns, Error> = (
            options,
        ) => {
            const [data, setData] = React.useState<Returns | undefined>();
            const [error, setError] = React.useState<Error | undefined>();
            const [loading, setLoading] = React.useState(false);
            const { getState, cacheManager } = useQuokkaContext()

            console.log(cacheManager)

            // TODO: when a mutation is done, find the queries which depends on it and update those (or run them again)
            // const c = useQuokkaContext()
            // c.update()

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
                        const json = await res.json();

                        if (res.ok) {
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

            const debouncedTrigger = React.useMemo(
                () => debounce(trigger, options?.debouncedDuration || 0),
                [trigger, options?.debouncedDuration],
            );

            return {data, trigger: debouncedTrigger, error, loading};
        };

        return useMutation;
    }

    protected invalidateCache() {
        const cacheManager = getCacheManager()
        const queries = this.api.queries

        for (let query of Object.values(queries)) {

        }
    }
}

function matchTag