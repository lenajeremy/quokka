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

function getContextHelper(callback: (v: CacheManager | undefined) => void) {
    return (
        <GeneralQuokkaContext.Consumer>
            {(value) => {
                callback(value.cacheManager);
                return null;
            }}
        </GeneralQuokkaContext.Consumer>
    );
}

export function getCacheManager(): CacheManager | undefined {
    let manager: CacheManager | undefined = undefined;
    getContextHelper(m => manager = m)
    return manager;
}