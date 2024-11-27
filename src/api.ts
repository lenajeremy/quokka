import React from "react";
import {MutationHookType, QueryHookType} from "./types";
import {Hookify, MutationHook, QueryHook, QuokkaApiMutationParams, QuokkaApiQueryParams,} from "./types/quokka";
import {debounce, generateRequestKey, resolveRequestParameters} from "./utils";
import {useQuokkaContext} from "./context";

export abstract class QuokkaApiAction<
    ParameterGenerator,
    HookNameType extends string,
    HookType,
> {
    protected generateParams: ParameterGenerator;
    protected requestName = "";
    protected hasSetKey = false;
    nameOfHook: HookNameType | undefined;

    protected constructor(generateParams: ParameterGenerator) {
        this.generateParams = generateParams;
    }

    setKey(key: string) {
        if (!this.hasSetKey) {
            this.requestName = key;
            this.hasSetKey = true;
        }
    }

    asHook(apiInit: Omit<CreateApiOptions<any>, "endpoints">) {
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

    protected abstract generateHookName(): HookNameType

    protected abstract generateHook(
        params: ParameterGenerator,
        apiInit: Omit<CreateApiOptions<any>, "endpoints">,
    ): HookType
}

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
                async function (data: Takes, useCache = false): Promise<Returns | undefined> {
                    const requestParams = resolveRequestParameters(
                        apiInit,
                        {
                            ...initRef.current,
                            ...params(data),
                        },
                    );

                    const key = await generateRequestKey(requestParams)
                    console.log("request key", key)
                    const value = get<Returns>(apiInit.apiName, queryThis.nameOfHook!, key)
                    console.log('request value', value)

                    if (value && useCache) {
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

export class QuokkaApiMutation<Takes, Returns> extends QuokkaApiAction<
    (a: Takes) => QuokkaApiMutationParams,
    MutationHookType,
    MutationHook<Takes, Returns, Error>
> {
    constructor(generateParams: (a: Takes) => QuokkaApiMutationParams) {
        super(generateParams);
    }

    protected generateHookName(): MutationHookType {
        const capitalized = this.requestName.charAt(0).toUpperCase() +
        this.requestName.slice(1) as Capitalize<string>;
        const hook = `use${capitalized}Mutation` as MutationHookType;
        this.nameOfHook = hook;
        return hook;
    }

    protected generateHook(
        params: (a: Takes) => QuokkaApiMutationParams,
        apiInit: Omit<CreateApiOptions<any>, "endpoints">,
    ) {
        // const queryThis = this
        const useMutation: MutationHook<Takes, Returns, Error> = (
            options,
        ) => {
            const [data, setData] = React.useState<Returns | undefined>();
            const [error, setError] = React.useState<Error | undefined>();
            const [loading, setLoading] = React.useState(false);

            // TODO: when a mutation is done, find the queries which depends on it and update those (or run them again)
            // const c = useQuokkaContext()
            // c.update()

            const trigger = React.useCallback(
                async function (data: Takes): Promise<Returns | undefined> {
                    const requestParams = resolveRequestParameters(
                        apiInit,
                        params(data),
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

            // React.useEffect(() => {
            //   if (isInitialRenderRef.current) {
            //     isInitialRenderRef.current = false;
            //     hasArgsChangedRef.current = false;
            //   } else {
            //     hasArgsChangedRef.current =
            //       JSON.stringify(initRef.current) !== JSON.stringify(params(args));
            //   }

            //   initRef.current = params(args);

            //   if (
            //     (options?.fetchOnRender && !hasRunFetchRef.current) ||
            //     (options?.fetchOnArgsChange && hasArgsChangedRef.current)
            //   ) {
            //     debouncedTrigger(args);
            //     hasRunFetchRef.current = true;
            //   }
            // }, [options, debouncedTrigger, args, params]);

            return {data, trigger: debouncedTrigger, error, loading};
        };

        return useMutation;
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
            return new QuokkaApiQuery<T, R>(val);
        };

        this.mutation = function <T, R>(val: (a: T) => QuokkaApiMutationParams) {
            return new QuokkaApiMutation<T, R>(val);
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
    private readonly apiName: string;
    private readonly prepareHeaders?: (globalState: any, headers: Headers) => Headers;
    private readonly baseUrl: string;

    private readonly builder: QuokkaRequestBuilder;
    actions: Hookify<T>;

    constructor(init: CreateApiOptions<T>) {
        this.builder = new QuokkaRequestBuilder();
        this.endpoints = init.endpoints(this.builder);
        this.apiName = init.apiName;
        this.prepareHeaders = init.prepareHeaders;
        this.baseUrl = init.baseUrl;
        this.actions = {} as Hookify<T>;

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

export function createApi<
    T extends Record<
        string,
        QuokkaApiQuery<any, any> | QuokkaApiMutation<any, any>
    >,
>(options: CreateApiOptions<T>): QuokkaApi<T> {
    return new QuokkaApi(options);
}
