type QuokkaRequestKey = string;
type QuokkaResponse = any;
type QuokkaContextValues = {
    requests: Record<QuokkaRequestKey, QuokkaResponse>;
    inValidateRequest: (key: string, value: QuokkaResponse) => void;
};
declare const QuokkaContext: import("react").Context<QuokkaContextValues>;
export declare function useQuokkaContext(): QuokkaContextValues;
export declare const QuokkaContextProvider: import("react").Provider<QuokkaContextValues>;
export default QuokkaContext;
