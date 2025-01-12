import React from "react";
export type QuokkaRequestContext<HookName extends string = string, Returns = any> = Record<HookName, Record<string, Returns>>;
export type QuokkaSingleApiContext = {
    queries: QuokkaRequestContext<string, unknown>;
    mutations: QuokkaRequestContext<string, unknown>;
};
export type QuokkaContextType = {
    apis: Record<string, QuokkaSingleApiContext>;
    setApi: React.Dispatch<React.SetStateAction<Record<string, QuokkaSingleApiContext>>>;
    getState: () => any;
};
