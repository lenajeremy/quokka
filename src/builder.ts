import {
  AnyFunction,
  BuilderObj,
  HookType,
  PrefixUseString,
} from "../types/index.js";
import { identifierToHook } from "./utils.js";

export function createBuilder<T extends BuilderObj>(
  options: T,
): PrefixUseString<T> {
  const optionsAsHook = Object.entries(options).reduce(
    (acc: Record<HookType, AnyFunction>, [identifier, fn]) => {
      const functionAsHook = identifierToHook(identifier);
      acc[functionAsHook] = fn;
      return acc;
    },
    {},
  ) as PrefixUseString<T>;

  return optionsAsHook;
}

const stuff = createBuilder({
  postNotifications: (val: string) => {
    console.log(val);
    return true;
  },
  fetchDashboardData: (name: string) => {
    if (name == "jeremiah") {
      return true;
    }
    return false;
  },
  initializeUserAccount: (yearOfBirth: number) => {
    return new Date().getFullYear() - yearOfBirth;
  },
});

export const {
  usePostNotificationsQuery,
  useFetchDashboardDataQuery,
  useInitializeUserAccountQuery,
} = stuff;
