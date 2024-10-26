import type { AnyFunction, HookType } from "./types/index";
import { CreateApiOptions } from "./api";
import type {
  QuokkaApiMutationParams,
  QuokkaApiQueryParams,
} from "./types/quokka";
export declare function debounce<T extends AnyFunction>(fn: T, ms: number): T;
export declare function identifierToHook<T extends string>(
  identifier: T,
): HookType<T>;
export declare function resolveRequestParameters<
  T extends QuokkaApiMutationParams | QuokkaApiQueryParams,
>(apiInit: Omit<CreateApiOptions<any>, "endpoints">, endpointParams: T): T;
