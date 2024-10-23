import { createContext, useContext } from "react";

type QuokkaRequestKey = string;
type QuokkaResponse = any;
type QuokkaContextValues = {
  requests: Record<QuokkaRequestKey, QuokkaResponse>;
  inValidateRequest: (key: string, value: QuokkaResponse) => void;
};

const QuokkaContext = createContext<QuokkaContextValues>({
  requests: {},
  inValidateRequest: () => {},
});

export function useQuokkaContext() {
  return useContext(QuokkaContext);
}

export const QuokkaContextProvider = QuokkaContext.Provider;

export default QuokkaContext;
