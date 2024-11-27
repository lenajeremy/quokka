import type {AnyFunction} from "./types";
import type {QuokkaApiMutationParams, QuokkaApiQueryParams,} from "./types/quokka";
import type {CreateApiOptions} from "./types/quokka";

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

function isQueryParams(
    p: QuokkaApiMutationParams | QuokkaApiQueryParams,
): p is QuokkaApiQueryParams {
    return !Object.hasOwn(p, "body");
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

/**
 * `mergeHeaders` merges a list of `Header`s into another `Header`. The most recent header takes preference and
 * overwrites the content of the least recently added ones.
 *
 * This means that the order of hierarchy is left to right. The headers closer to the right of the array overrides
 * the values of preceding headers
 * */
function mergeHeaders(
    headers: (Headers | undefined)[],
    into: Headers,
): Headers {
    for (let h of headers) {
        h?.forEach((value, key) => {
            into.set(key, value);
        });
    }
    return into;
}

/**
 * `resolveRequestParameters` merge request params from a single request with those
 * from the parent api from which it's defined.
 *
 * Use cases:
 *
 * - Merging headers set in the api with new headers specific to a single request.
 * - Merging search params
 */
export function resolveRequestParameters<
    T extends QuokkaApiMutationParams | QuokkaApiQueryParams,
>(apiInit: Omit<CreateApiOptions<any>, "endpoints">, endpointParams: T, getState: () => any): T {
    // resolve url
    const url = resolveUrl(
        apiInit.baseUrl,
        endpointParams.url,
        endpointParams.params,
    );

    // resolve headers
    const headers = new Headers();
    if (apiInit.prepareHeaders) {
        mergeHeaders([
            apiInit.prepareHeaders(getState, new Headers()),
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

/**
 * `generateRequestKey` generates a unique key for a particular request using the request parameters.
 *
 * This helps to dedupe request by ensuring that requests with the same parameters (body, url, method, etc.)
 * are resolved to the same key.
 * */
export async function generateRequestKey(requestParams: QuokkaApiQueryParams | QuokkaApiMutationParams): Promise<string> {
    const sortedParams = sortKeys({...requestParams})
    return await generateSHA256Hash(JSON.stringify(sortedParams))
}

/**
 * `sortKeys` takes an object, and returns a new object with the keys in sorted order.
 *
 * It recursively sorts the keys of the child objects as well. This helps so that request
 * parameters would always have the same form so they are dedupe correctly.
 *
 * Examples:
 * ```javascript
 * const obj1 = {name: "Jeremiah", age: "22", company: "Meta"}
 * const obj2 = {company: "Meta", name: 'Jeremiah', age: "22"}
 *
 * const sortedObj1 = sortKeys(obj1)
 * console.log(sortedObj1)  // {age: "22", company: "Meta", name: "Jeremiah"}
 *
 * const sortedObj2 = sortKeys(obj2)
 * console.log(sortedObj2)  // {age: "22", company: "Meta", name: "Jeremiah"}
 *
 * deepCompare(sortedObj1, sortedObj2) // true
 * ```
 * */
function sortKeys<T = string | number | object | any[]>(obj: T): T {
    if (Array.isArray(obj)) {
        return obj.map(sortKeys) as T;
    } else if (isObject(obj)) {
        return Object.keys(obj)
            .sort()
            .reduce((acc, key) => {
                acc[key] = sortKeys(obj[key]);
                return acc;
            }, {} as Record<string, any>) as T;
    } else {
        return obj;
    }
}

function isObject(obj: any): obj is Record<string, any> {
    return obj !== null && typeof obj === 'object'
}

/**
 * `generateSHA256Hash` generates a unique hash provided a string.
 * */
async function generateSHA256Hash(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    return Array.from(new Uint8Array(hashBuffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}