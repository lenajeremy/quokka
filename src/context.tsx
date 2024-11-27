import * as React from "react";

type QuokkaRequestContext<
    HookName extends string = string,
    Returns = any
> = Record<HookName, Record<string, Returns>>;

type QuokkaSingleApiContext = {
    queries: QuokkaRequestContext<string, unknown>;
    mutations: QuokkaRequestContext<string, unknown>;
    // tags: T;
};

type QuokkaContextType = {
    apis: Record<string, QuokkaSingleApiContext>;
    setApi: React.Dispatch<
        React.SetStateAction<Record<string, QuokkaSingleApiContext>>
    >;
};

const GeneralQuokkaContext = React.createContext<QuokkaContextType>({
    apis: {},
    setApi: () => {},
});

export function useQuokkaContext() {
    const {apis, setApi} = React.useContext(GeneralQuokkaContext);
    const apisRef = React.useRef(apis);

    React.useEffect(() => {
        apisRef.current = apis
    }, [apis])

    return {
        update: (apiName: string, hookName: string, id: string, value: unknown) => {
            const apis = apisRef.current;
            let api = apis[apiName];
            if (!api) {
                api = {
                    queries: {},
                    mutations: {},
                };
            }

            // get the key --- key or mutation
            const key = hookName.endsWith("Mutation") ? "mutations" : "queries";

            // get the query or mutation
            const queryOrMutation = api[key];

            if (!queryOrMutation[hookName]) {
                queryOrMutation[hookName] = {}
            }
            queryOrMutation[hookName][id] = value;

            setApi(apis => ({...apis, [apiName]: api}));
        },
        get<T>(apiName: string, hookName: string, id: string): T | undefined {
            const apis = apisRef.current;
            const key = hookName.endsWith("Mutation") ? "mutations" : "queries";

            if (
                apis[apiName] &&
                apis[apiName][key][hookName] &&
                apis[apiName][key][hookName][id]
            ) {
                return apis[apiName][key][hookName][id] as T
            }
        },
    };
}

export function QuokkaContextProvider({ children }: { children: React.ReactNode; }) {
    const [apis, setApi] = React.useState<
        Record<string, QuokkaSingleApiContext>
    >({});

    return (
        <GeneralQuokkaContext.Provider value={{apis, setApi}}>
            {children}
        </GeneralQuokkaContext.Provider>
    );
}

export default GeneralQuokkaContext;
