export type UseFetchReturn<CallArgs, ReturnArgs, TError = unknown> = {
  data: ReturnArgs | undefined;
  trigger: (args: CallArgs) => Promise<ReturnArgs | null>;
  error: TError | undefined;
  loading: boolean;
};
