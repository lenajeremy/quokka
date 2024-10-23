import { debounce } from "./utils.js";
import React from "react";

type UseFetchReturn<CallArgs, ReturnArgs, TError = unknown> = {
  data: ReturnArgs | undefined;
  trigger: (args: CallArgs) => Promise<ReturnArgs | null>;
  error: TError | undefined;
  loading: boolean;
};

export default function useFetch<
  TArgs = void,
  TReturns = void,
  TError = void,
>(
  input: RequestInfo,
  init?: RequestInit,
  options?: {
    fetchOnRender?: boolean;
    fetchOnArgsChange?: boolean;
    debouncedDuration?: number;
  },
): UseFetchReturn<TArgs, TReturns, TError> {
  const inputRef = React.useRef(input);
  const initRef = React.useRef(init);
  const hasRunFetchRef = React.useRef(false);
  const hasArgsChangedRef = React.useRef(false);
  const isInitialRenderRef = React.useRef(true);

  const [data, setData] = React.useState<TReturns | undefined>();
  const [error, setError] = React.useState<TError | undefined>();
  const [loading, setLoading] = React.useState(false);

  const trigger = React.useCallback(
    async function (data: TArgs): Promise<TReturns | null> {
      hasRunFetchRef.current = true;
      try {
        setLoading(true);
        setData(undefined);
        setError(undefined);

        const res = await fetch(inputRef.current, {
          ...initRef.current,
          body: data instanceof FormData ? data : JSON.stringify(data),
        });
        const json = await res.json();

        if (res.ok) {
          setData(json);
          return json;
        } else {
          throw json;
        }
      } catch (err) {
        setError(err as TError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
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
        JSON.stringify(inputRef.current) !== JSON.stringify(input) ||
        JSON.stringify(initRef.current) !== JSON.stringify(init);
    }

    inputRef.current = input;
    initRef.current = init;

    if (
      (options?.fetchOnRender && !hasRunFetchRef.current) ||
      (options?.fetchOnArgsChange && hasArgsChangedRef.current)
    ) {
      debouncedTrigger(init?.body as TArgs);
    }
  }, [options, input, init, debouncedTrigger]);

  return { data, trigger, error, loading };
}
