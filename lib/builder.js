"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import {AnyFunction, BuilderObj, HookType, PrefixUseString,} from "./types"
// import {identifierToHook} from "./utils";
//
// export function createBuilder<T extends BuilderObj>(
//   options: T,
// ): PrefixUseString<T> {
//   return Object.entries(options).reduce(
//       (acc: Record<HookType, AnyFunction>, [identifier, fn]) => {
//         const functionAsHook = identifierToHook(identifier);
//         acc[functionAsHook] = fn;
//         return acc;
//       },
//       {},
//   ) as PrefixUseString<T>;
// }
//
// const stuff = createBuilder({
//   postNotifications: (val: string) => {
//     console.log(val);
//     return true;
//   },
//   fetchDashboardData: (name: string) => {
//     return name === "jeremiah";
//   },
//   initializeUserAccount: (yearOfBirth: number) => {
//     return new Date().getFullYear() - yearOfBirth;
//   },
// });
//
// export const {
//   usePostNotificationsQuery,
//   useFetchDashboardDataQuery,
//   useInitializeUserAccountQuery,
// } = stuff;
