import type { UseFetchReturn } from "./types/fetch.js";
export default function useFetch<TArgs = void, TReturns = void, TError = void>(
  input: RequestInfo,
  init?: RequestInit,
  options?: {
    fetchOnRender?: boolean;
    fetchOnArgsChange?: boolean;
    debouncedDuration?: number;
  },
): UseFetchReturn<TArgs, TReturns, TError>;
