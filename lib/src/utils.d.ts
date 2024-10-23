import type { AnyFunction, HookType } from "../types/index.js";
export declare function debounce<T extends AnyFunction>(
  fn: T,
  seconds: number,
): T;
export declare function identifierToHook<T extends string>(
  identifier: T,
): HookType<T>;
