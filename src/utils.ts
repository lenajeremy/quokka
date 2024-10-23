import type { AnyFunction, HookType } from "../types/index.js";

export function debounce<T extends AnyFunction>(fn: T, seconds: number): T {
  let timer: number;

  return function () {
    const args = arguments;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      // @ts-expect-error
      fn.apply(this, args);
    }, seconds * 1000);
  } as unknown as T;
}

export function identifierToHook<T extends string>(identifier: T): HookType<T> {
  const capitalized =
    (identifier.charAt(0).toUpperCase() + identifier.slice(1)) as Capitalize<T>;
  return `use${capitalized}Query`;
}
