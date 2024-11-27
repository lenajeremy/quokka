import type { AnyFunction } from "./types";
import type { QuokkaApiMutationParams, QuokkaApiQueryParams } from "./types/quokka";
import type { CreateApiOptions } from "./types/quokka";
export declare function debounce<T extends AnyFunction>(fn: T, ms: number): T;
/**
 * `resolveRequestParameters` merge request params from a single request with those
 * from the parent api from which it's defined.
 *
 * Use cases:
 *
 * - Merging headers set in the api with new headers specific to a single request.
 * - Merging search params
 */
export declare function resolveRequestParameters<T extends QuokkaApiMutationParams | QuokkaApiQueryParams>(apiInit: Omit<CreateApiOptions<any>, "endpoints">, endpointParams: T): T;
/**
 * `generateRequestKey` generates a unique key for a particular request using the request parameters.
 *
 * This helps to dedupe request by ensuring that requests with the same parameters (body, url, method, etc.)
 * are resolved to the same key.
 * */
export declare function generateRequestKey(requestParams: QuokkaApiQueryParams | QuokkaApiMutationParams): Promise<string>;
