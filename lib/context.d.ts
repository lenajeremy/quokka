import React from "react";
export declare function useQuokkaContext(): {
    update: (apiName: string, hookName: string, id: string, value: unknown) => void;
    get<T>(apiName: string, hookName: string, id: string): T | undefined;
};
export declare function QuokkaContextProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
