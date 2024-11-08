import * as React from "react";

type QuokkaRequestContext<
  HookName extends string = string,
  Returns = any
> = Record<HookName, Record<string, Returns>>;

type QuokkaSingleApiContext<T extends string | string[]> = {
  queries: QuokkaRequestContext<string, unknown>;
  mutations: QuokkaRequestContext<string, unknown>;
  // tags: T;
};

type QuokkaContextType = {
  apis: Record<string, QuokkaSingleApiContext<any>>;
  setApi: React.Dispatch<
    React.SetStateAction<Record<string, QuokkaSingleApiContext<any>>>
  >;
};

const GeneralQuokkaContext = React.createContext<QuokkaContextType>({
  apis: {},
  setApi: (api) => {},
});

export function useQuokkaContext() {
  const { apis, setApi } = React.useContext(GeneralQuokkaContext);

  return {
    update: (apiName: string, hookName: string, id: string, value: unknown) => {
      let api = apis[apiName];
      if (!api) {
        api = {
          queries: {},
          mutations: {},
        };
      }
      if (hookName.endsWith("Mutation")) {
        if (!api.mutations[hookName]) {
          api.mutations[hookName] = {};
        }

        api.mutations[hookName][id] = value;
      } else {
        if (!api.queries[hookName]) {
          api.queries[hookName] = {};
        }
        api.queries[hookName][id] = value;
      }

      setApi({ ...apis, [apiName]: api });
    },
    get<T>(apiName: string, hookName: string, id: string): T | undefined {
      if (hookName.endsWith("Mutation")) {
        if (
          apis[apiName] &&
          apis[apiName].mutations[hookName] &&
          apis[apiName].mutations[hookName][id]
        ) {
          return apis[apiName].mutations[hookName][id] as T;
        }
      } else {
        if (
          apis[apiName] &&
          apis[apiName].queries[hookName] &&
          apis[apiName].queries[hookName][id]
        ) {
          return apis[apiName].queries[hookName][id] as T;
        }
      }

      return undefined;
    },
  };
}

export function QuokkaContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [apis, setApi] = React.useState<
    Record<string, QuokkaSingleApiContext<any>>
  >({});

  return (
    <GeneralQuokkaContext.Provider value={{ apis, setApi }}>
      {children}
    </GeneralQuokkaContext.Provider>
  );
}
export default GeneralQuokkaContext;
