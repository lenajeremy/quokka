import type { AnyFunction, HookType } from "./types/index";
import { CreateApiOptions } from "./api";
import type {
  QuokkaApiMutationParams,
  QuokkaApiQueryParams,
} from "./types/quokka";

export function debounce<T extends AnyFunction>(fn: T, ms: number): T {
  let timer: number;

  return function () {
    const args = arguments;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      // @ts-expect-error
      fn.apply(this, args);
    }, ms);
  } as unknown as T;
}

export function identifierToHook<T extends string>(identifier: T): HookType<T> {
  const capitalized =
    (identifier.charAt(0).toUpperCase() + identifier.slice(1)) as Capitalize<T>;
  return `use${capitalized}Query`;
}

function isQueryParams(
  p: QuokkaApiMutationParams | QuokkaApiQueryParams,
): p is QuokkaApiQueryParams {
  return Object.hasOwn(p, "body") === false;
}

function resolveUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, string>,
): string {
  // combining the urls need some work
  let url = new URL(
    (baseUrl.endsWith("/") ? baseUrl.slice(0, baseUrl.length - 1) : baseUrl) +
      (path.startsWith("/") ? path : `/${path}`),
  );

  Object.entries(params || {}).forEach((entry) => {
    url.searchParams.set(entry[0], entry[1]);
  });

  return url.toString();
}

function mergeHeaders(
  headers: (Headers | undefined)[],
  into: Headers,
): Headers {
  /// the more recent headers should take preference and
  /// overwrite the content of the least recently added onces
  /// This means that the order of hierarchy is left to right
  for (let h of headers) {
    h?.forEach((value, key) => {
      into.set(key, value);
    });
  }
  return into;
}

export function resolveRequestParameters<
  T extends QuokkaApiMutationParams | QuokkaApiQueryParams,
>(apiInit: Omit<CreateApiOptions<any>, "endpoints">, endpointParams: T): T {
  // resolve url
  const url = resolveUrl(
    apiInit.baseUrl,
    endpointParams.url,
    endpointParams.params,
  );

  console.log(apiInit, endpointParams);

  // resolve headers
  const headers = new Headers();
  if (apiInit.prepareHeaders) {
    mergeHeaders([
      apiInit.prepareHeaders({}, new Headers()),
      endpointParams.headers,
    ], headers);
  } else {
    mergeHeaders([endpointParams.headers], headers);
  }

  if (isQueryParams(endpointParams)) {
    return {
      url,
      headers,
      method: endpointParams.method,
      params: endpointParams.params,
    } as typeof endpointParams;
  } else {
    return {
      url,
      headers,
      method: endpointParams.method,
      params: endpointParams.params,
      body: endpointParams.body,
    } as typeof endpointParams;
  }
}
