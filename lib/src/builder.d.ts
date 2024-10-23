import { BuilderObj, PrefixUseString } from "../types/index.js";
export declare function createBuilder<T extends BuilderObj>(options: T): PrefixUseString<T>;
export declare const usePostNotificationsQuery: (val: string) => true, useFetchDashboardDataQuery: (name: string) => boolean, useInitializeUserAccountQuery: (yearOfBirth: number) => number;
