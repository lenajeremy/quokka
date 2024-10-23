type UseFetchReturn<CallArgs, ReturnArgs, TError = unknown> = {
    data: ReturnArgs | undefined;
    trigger: (args: CallArgs) => Promise<ReturnArgs | null>;
    error: TError | undefined;
    loading: boolean;
};
export default function useFetch<TArgs = void, TReturns = void, TError = void>(input: RequestInfo, init?: RequestInit, options?: {
    fetchOnRender?: boolean;
    fetchOnArgsChange?: boolean;
    debouncedDuration?: number;
}): UseFetchReturn<TArgs, TReturns, TError>;
export {};
