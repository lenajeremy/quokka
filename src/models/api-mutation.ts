import React from "react";
import {QuokkaApiAction} from "./api-action";
import {MutationHook, QuokkaApiMutationParams} from "../types/quokka";
import {MutationHookType} from "../types";
import {debounce, resolveRequestParameters} from "../utils";
import {CreateApiOptions} from "../types/quokka";

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