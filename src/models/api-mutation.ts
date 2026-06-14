import React from "react";
import { QuokkaApiAction } from "./api-action";
import {
  CreateApiOptions,
  MutationHook,
  MutationHookOptions,
  QuokkaApiMutationParams,
} from "../types/quokka";
import { MutationHookType, TagType } from "../types";
import { hasMatchingTags, resolveRequestParameters } from "../utils";
import { useQuokkaContext } from "../context";
import { QuokkaApi } from "./quokka-api";
import { CacheManager } from "../cache";

export class QuokkaApiMutation<
  Takes,
  Returns,
  TagString,
> extends QuokkaApiAction<
  (a: Takes) => QuokkaApiMutationParams<TagString, Returns>,
  MutationHookType,
  MutationHook<Takes, Returns, Error, TagString>
> {
  tags?: TagType<TagString, Returns>;

  constructor(
    generateParams: (a: Takes) => QuokkaApiMutationParams<TagString, Returns>,
    api: QuokkaApi<any, any>,
    options?: {
      invalidatesTags?: TagType<TagString, Returns>;
    },
  ) {
    super(generateParams, api);
    this.tags = options?.invalidatesTags;
  }

  protected generateHookName(): MutationHookType {
    const capitalized = (this.requestName.charAt(0).toUpperCase() +
      this.requestName.slice(1)) as Capitalize<string>;
    const hook = `use${capitalized}Mutation` as MutationHookType;
    this.nameOfHook = hook;
    return hook;
  }

  protected generateHook(
    params: (a: Takes) => QuokkaApiMutationParams<TagString, Returns>,
    apiInit: Omit<CreateApiOptions<any, TagString>, "endpoints">,
  ) {
    const mutationThis = this;
    const useMutation: MutationHook<Takes, Returns, Error, TagString> = (
      options,
    ) => {
      const [data, setData] = React.useState<Returns | undefined>();
      const [error, setError] = React.useState<Error | undefined>();
      const [loading, setLoading] = React.useState(false);
      const { getState, cacheManager } = useQuokkaContext();

      const cacheManagerRef = React.useRef(cacheManager);
      const getStateRef = React.useRef(getState);
      const optionsRef = React.useRef(options);
      cacheManagerRef.current = cacheManager;
      getStateRef.current = getState;
      optionsRef.current = options;

      const trigger = React.useCallback(async function (
        data: Takes,
        callTimeOptions?: MutationHookOptions<TagString, Returns>,
      ): Promise<Returns | undefined> {
        let err = null;

        const requestParams = resolveRequestParameters(
          apiInit,
          params(data),
          getStateRef.current!,
        );

        try {
          setLoading(true);
          setData(undefined);
          setError(undefined);

          const res = await fetch(requestParams.url, {
            method: requestParams.method,
            headers: requestParams.headers,
            body:
              requestParams.body instanceof FormData
                ? requestParams.body
                : JSON.stringify(requestParams.body),
          });

          if (res.ok) {
            const json = await res.json();
            if (cacheManagerRef.current) {
              mutationThis.invalidateCache(
                cacheManagerRef.current,
                json,
                callTimeOptions?.invalidates ?? optionsRef.current?.invalidates,
              );
            }
            setData(json);
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
          if (err) {
            setError(err as Error);
            throw err;
          }
        }
      }, []);

      return { data, trigger, error, loading };
    };

    return useMutation;
  }

  protected invalidateCache(
    cacheManager: CacheManager,
    res: Returns,
    invalidates?: TagType<TagString, Returns>,
  ) {
    const r = /^use(\w+)Query$/;

    for (let cacheEntry of Object.values(
      cacheManager.apis[this.api.apiName] ?? [],
    )) {
      if (
        hasMatchingTags(this.tags, cacheEntry.tags, cacheEntry.result) ||
        hasMatchingTags(invalidates, cacheEntry.tags, cacheEntry.result)
      ) {
        const match = cacheEntry.name.match(r);
        if (match) {
          const key = match[1].charAt(0).toLowerCase() + match[1].substring(1);
          this.api.queries[key].triggers.forEach(t => t(cacheEntry.payload));
        }
      }
    }
  }
}
