import React from "react";
import {CacheManager} from "./cache";

const GeneralQuokkaContext = React.createContext<{ cacheManager?: CacheManager, getState?: () => any }>({});

export function useQuokkaContext() {
    return React.useContext(GeneralQuokkaContext)
}

export function QuokkaProvider<RootState>({children, getState}: {
    children: React.ReactNode;
    getState: () => RootState
}) {
    const cacheManager = new CacheManager()
    return (
        <GeneralQuokkaContext.Provider value={{cacheManager, getState}}>
            {children}
        </GeneralQuokkaContext.Provider>
    );
}
