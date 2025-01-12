import React from "react";
import { CacheManager } from "./cache";
export declare function useQuokkaContext(): {
    cacheManager?: CacheManager;
    getState?: () => any;
};
export declare function QuokkaProvider<RootState>({ children, getState }: {
    children: React.ReactNode;
    getState: () => RootState;
}): import("react/jsx-runtime").JSX.Element;
