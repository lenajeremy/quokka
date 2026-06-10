import { type AnyFunction, type TagType } from "./types";
import type { CreateApiOptions, QuokkaApiMutationParams, QuokkaApiQueryParams } from "./types/quokka";
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
export declare function resolveRequestParameters<TagString, T extends QuokkaApiMutationParams<TagString, any> | QuokkaApiQueryParams<TagString, any>>(apiInit: Omit<CreateApiOptions<any, TagString>, "endpoints">, endpointParams: T, getState: () => any): T;
/**
 * `generateRequestKey` generates a unique key for a particular request using the request parameters.
 *
 * This helps to dedupe request by ensuring that requests with the same parameters (body, url, method, etc.)
 * are resolved to the same key.
 * */
export declare function generateRequestKey<T, R>(requestParams: QuokkaApiQueryParams<T, R> | QuokkaApiMutationParams<T, R>): Promise<string>;
export declare function hasMatchingTags<T extends string, R>(mTags?: TagType<T, R>, qTags?: TagType<T, R>, res?: R): boolean;
