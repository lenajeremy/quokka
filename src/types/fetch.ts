/**
 * `UseFetchReturn<CallArgs, ReturnArgs, Error>` describes the return value when you call
 * a query or mutation hook.
 *
 * Example:
 *
 * ```javascript
 * const res = useGetTodo({ id: 1 })
 * console.log(res.data, res.trigger, res.error, res.loading)
 * ```
*/
export type UseFetchReturn<CallArgs, ReturnArgs, TError = unknown, TriggerOptions = void> = {
  data: ReturnArgs | undefined;
  trigger: (args: CallArgs, options?: TriggerOptions) => Promise<ReturnArgs | undefined>;
  error: TError | undefined;
  loading: boolean;
  initLoading?: boolean;
};

