import React from "react";
import { QuokkaApiAction } from "./api-action";
import {
  CreateApiOptions,
  QueryHook,
  QuokkaApiQueryParams,
} from "../types/quokka";
import { QueryHookType, TagType } from "../types";
import { useQuokkaContext } from "../context";
import {
  debounce,
  generateRequestKey,
  resolveRequestParameters,
} from "../utils";
import { QuokkaApi } from "./quokka-api";
import { CacheManager } from "../cache";

type ProviderState<Takes, Returns> = {
  triggers: Set<(takes: Takes) => void>;
  inFlight: Map<string, Promise<Returns | undefined>>;
};

export class QuokkaApiQuery<Takes, Returns, TagsString> extends QuokkaApiAction<
  (a: Takes) => QuokkaApiQueryParams<TagsString, Returns>,
  QueryHookType,
  QueryHook<Takes, Returns, Error, TagsString>
> {
  tags: TagType<TagsString, Returns>;

  // Per-provider state — keyed by CacheManager instance so separate
  // QuokkaProvider trees each get their own isolated triggers and inFlight map.
  private providerState = new WeakMap<CacheManager, ProviderState<Takes, Returns>>();

  getProviderState(cm: CacheManager): ProviderState<Takes, Returns> {
    if (!this.providerState.has(cm)) {
      this.providerState.set(cm, { triggers: new Set(), inFlight: new Map() });
    }
    return this.providerState.get(cm)!;
  }

  constructor(
    generateParams: (a: Takes) => QuokkaApiQueryParams<TagsString, Returns>,
    api: QuokkaApi<any, any>,
    options?: {
      providesTags?: TagType<TagsString, Returns>;
    },
  ) {
    super(generateParams, api);
    this.tags = options?.providesTags || [];
  }

  protected generateHookName(): QueryHookType {
    const capitalized = (this.requestName.charAt(0).toUpperCase() +
      this.requestName.slice(1)) as Capitalize<string>;
    const hook = `use${capitalized}Query` as QueryHookType;
    this.nameOfHook = hook;
    return hook;
  }

  protected generateHook(
    params: (a: Takes) => QuokkaApiQueryParams<TagsString, Returns>,
    apiInit: Omit<CreateApiOptions<any, TagsString>, "endpoints">,
  ) {
    const queryThis = this;

    const useQuery: QueryHook<Takes, Returns, Error, TagsString> = (
      args,
      options,
    ) => {
      const initRef = React.useRef(params(args));
      const hasRunFetchRef = React.useRef(false);
      const hasArgsChangedRef = React.useRef(false);
      const isInitialRenderRef = React.useRef(true);

      // Always-current ref for args so event-listener and polling closures
      // see the latest args without needing to be re-registered.
      const argsRef = React.useRef(args);
      argsRef.current = args;

      const [data, setData] = React.useState<Returns | undefined>();
      const [error, setError] = React.useState<Error | undefined>();
      const [loading, setLoading] = React.useState(false);
      const [initLoading, setInitLoading] = React.useState(false);

      const { cacheManager, getState } = useQuokkaContext();

      const cacheManagerRef = React.useRef(cacheManager);
      const getStateRef = React.useRef(getState);
      const optionsRef = React.useRef(options);
      cacheManagerRef.current = cacheManager;
      getStateRef.current = getState;
      optionsRef.current = options;

      let timeout = React.useRef<number>();

      React.useEffect(() => {
        // Use argsRef so focus/online/polling always refetch with current args.
        const refetch = () => trigger(argsRef.current, false);

        if (options?.refetchOnFocus) {
          window.addEventListener("focus", refetch);
        }

        if (options?.refetchOnConnection) {
          window.addEventListener("online", refetch);
        }

        if (options?.pollingInterval && options?.pollingInterval > 0) {
          const i = setInterval(refetch, options.pollingInterval);
          timeout.current = i;
        }

        return () => {
          window.removeEventListener("focus", refetch);
          window.removeEventListener("online", refetch);

          if (timeout.current) {
            clearInterval(timeout.current);
          }
        };
      }, [options?.refetchOnFocus, options?.refetchOnConnection, options?.pollingInterval]);

      const trigger = React.useCallback(async function (
        data: Takes,
        fetchFromCache = false,
      ): Promise<Returns | undefined> {
        const requestParams = resolveRequestParameters(
          apiInit,
          {
            ...initRef.current,
            ...params(data),
          },
          getStateRef.current!,
        );

        // Include sorted headers in the dedup key so requests with different
        // auth tokens (same URL, different Authorization header) are not merged.
        const headerParts: string[] = [];
        requestParams.headers?.forEach((v, k) => headerParts.push(`${k}=${v}`));
        const dedupKey = `${requestParams.url}::${requestParams.method ?? "GET"}::${headerParts.sort().join("&")}`;

        const { inFlight } = queryThis.getProviderState(cacheManagerRef.current!);

        if (inFlight.has(dedupKey)) {
          // A request for this exact endpoint+user is already in-flight.
          // Attach THIS component's state setters to the shared promise so
          // both callers see loading → data/error updates.
          const existing = inFlight.get(dedupKey)!;
          setLoading(true);
          setError(undefined); // clear any stale error from a prior failed request
          return existing
            .then((result) => {
              if (result !== undefined) setData(result);
              return result;
            })
            .catch((err: Error) => {
              setError(err);
              throw err;
            })
            .finally(() => {
              setLoading(false);
              setInitLoading(false);
            });
        }

        const request = (async () => {
          let err: any = null;

          const key = await generateRequestKey(requestParams);
          const value = cacheManagerRef.current!.get<Returns, TagsString>(
            apiInit.apiName,
            queryThis.nameOfHook!,
            key,
            queryThis.tags,
          );

          if (value && fetchFromCache) {
            setData(value);
            inFlight.delete(dedupKey); // prevent the resolved promise leaking in the map
            return value;
          }

          try {
            setLoading(true);
            setError(undefined);

            const res = await fetch(requestParams.url, {
              method: requestParams.method,
              headers: requestParams.headers,
            });

            if (res.ok) {
              const json = await res.json();
              setData(json);
              cacheManagerRef.current!.update(
                apiInit.apiName,
                queryThis.nameOfHook!,
                key,
                queryThis.tags,
                json,
                requestParams,
                data,
                optionsRef.current?.ttl,
              );
              return json;
            } else {
              try { err = await res.json(); }
              catch { err = { status: res.status, statusText: res.statusText }; }
            }
          } catch (err) {
            setError(err as Error);
            throw err;
          } finally {
            setLoading(false);
            setInitLoading(false);
            inFlight.delete(dedupKey);
            if (err) {
              setError(err);
              throw err;
            }
          }
        })();

        inFlight.set(dedupKey, request);
        return request;
      }, []);

      React.useEffect(() => {
        const { triggers } = queryThis.getProviderState(cacheManagerRef.current!);
        triggers.add(trigger);
        return () => { triggers.delete(trigger); };
      }, [trigger]);

      const publicTrigger = React.useCallback(
        (data: Takes) => trigger(data, false),
        [trigger],
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
          (async function () {
            await debouncedTrigger(args, true);
          })();
          hasRunFetchRef.current = true;
          setInitLoading(true);
        }
      }, [options?.fetchOnRender, options?.fetchOnArgsChange, debouncedTrigger, args]);

      return { data, trigger: publicTrigger, error, loading, initLoading };
    };

    return useQuery;
  }
}
