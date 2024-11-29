import type {AnyFunction, TagType} from "./types";
import type {CreateApiOptions, QuokkaApiMutationParams, QuokkaApiQueryParams,} from "./types/quokka";

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

function isQueryParams<T>(
    p: QuokkaApiMutationParams<T> | QuokkaApiQueryParams<T>,
): p is QuokkaApiQueryParams<T> {
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
    TagString,
    T extends QuokkaApiMutationParams<TagString> | QuokkaApiQueryParams<TagString>,
>(apiInit: Omit<CreateApiOptions<any, TagString>, "endpoints">, endpointParams: T, getState: () => any): T {
    // resolve url
    const url = resolveUrl(
        apiInit.baseUrl,
        endpointParams.url,
        endpointParams.params,
    );

    // resolve headers
    const headers = new Headers();
    headers.set("content-type", "application/json");
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
export async function generateRequestKey<T>(requestParams: QuokkaApiQueryParams<T> | QuokkaApiMutationParams<T>): Promise<string> {
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

export function hasMatchingTags<T>(mTags?: TagType<T>, qTags?: TagType<T>): boolean {
    console.log(mTags, qTags)
    if (!mTags || !qTags) return false

    if (!(mTags || qTags) || (mTags.length == 0 && qTags.length == 0)) return true;

    for (const mTag of mTags) {
        for (const qTag of qTags) {
            if (deepCompare(mTag instanceof Function ? mTag() : mTag as any, qTag instanceof Function ? qTag() : qTag as any)) {
                return true
            }
        }
    }
    return false
}

type ValidObj = number | string | object | null | undefined

function deepCompare(obj1: ValidObj, obj2: ValidObj) {
    if (!obj1 || !obj2 || typeof obj2 !== 'object' || typeof obj1 !== 'object') {
        return obj1 === obj2
    }

    if (Array.isArray(obj1)) {
        if (Array.isArray(obj2)) {
            if (obj1.length !== obj2.length) {
                return false;
            }
            for (let i = 0; i < obj1.length; i++) {
                if (!deepCompare(obj1[i], obj2[i])) {
                    return false
                }
            }
        } else {
            return false;
        }
    } else {
        if (Array.isArray(obj2)) {
            return false
        }
        if (Object.keys(obj2).length !== Object.keys(obj1).length) {
            return false
        }
        for (const key of Object.keys(obj1)) {
            // @ts-ignore
            if (!deepCompare(obj1[key], obj2[key])) {
                return false
            }
        }
    }
    return true;
}