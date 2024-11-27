import React from "react";
import {QuokkaApiAction} from "./api-action";
import {CreateApiOptions, QueryHook, QuokkaApiQueryParams} from "../types/quokka";
import {QueryHookType} from "../types";
import {useQuokkaContext} from "../context";
import {debounce, generateRequestKey, resolveRequestParameters} from "../utils";

export class QuokkaApiQuery<Takes, Returns> extends QuokkaApiAction<
    (a: Takes) => QuokkaApiQueryParams,
    QueryHookType,
    QueryHook<Takes, Returns, Error>
> {
    constructor(generateParams: (a: Takes) => QuokkaApiQueryParams) {
        super(generateParams);
    }

    protected generateHookName(): QueryHookType {
        const capitalized = (this.requestName.charAt(0).toUpperCase() +
            this.requestName.slice(1)) as Capitalize<string>;
        const hook = `use${capitalized}Query` as QueryHookType;
        this.nameOfHook = hook;
        return hook;
    }

    protected generateHook(
        params: (a: Takes) => QuokkaApiQueryParams,
        apiInit: Omit<CreateApiOptions<any>, "endpoints">,
    ) {
        const queryThis = this

        const useQuery: QueryHook<Takes, Returns, Error> = (
            args,
            options,
        ) => {
            const initRef = React.useRef(params(args));
            const hasRunFetchRef = React.useRef(false);
            const hasArgsChangedRef = React.useRef(false);
            const isInitialRenderRef = React.useRef(true);

            const [data, setData] = React.useState<Returns | undefined>();
            const [error, setError] = React.useState<Error | undefined>();
            const [loading, setLoading] = React.useState(false);

            const {update, get} = useQuokkaContext()
            let err: any = null

            const trigger = React.useCallback(
                async function (data: Takes, fetchFromCache = false): Promise<Returns | undefined> {
                    const requestParams = resolveRequestParameters(
                        apiInit,
                        {
                            ...initRef.current,
                            ...params(data),
                        },
                    );

                    const key = await generateRequestKey(requestParams)
                    const value = get<Returns>(apiInit.apiName, queryThis.nameOfHook!, key)

                    if (value && fetchFromCache) {
                        setData(value)
                        return value
                    } else {
                        try {
                            setLoading(true);
                            setData(undefined);
                            setError(undefined);

                            const res = await fetch(requestParams.url, {
                                method: requestParams.method,
                                headers: requestParams.headers,
                            });
                            const json = await res.json();

                            if (!res.ok) {
                                setData(json);
                                update(apiInit.apiName, queryThis.nameOfHook!, key, json)
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
                            throw err;
                        }
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
                    debouncedTrigger(args, true).then();
                    hasRunFetchRef.current = true;
                }
            }, [options, debouncedTrigger, args, params]);

            return {data, trigger, error, loading};
        };

        return useQuery;
    }
}