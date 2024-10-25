// deno-lint-ignore ban-types
export type AnyFunction = Function;
export type BuilderObj = Record<string, AnyFunction>;
export type HookType<T extends string = string> = `use${Capitalize<T>}Query`;

export type QueryHookType<T extends string = string> = `use${Capitalize<
  T
>}Query`;
export type MutationHookType<T extends string = string> = `use${Capitalize<
  T
>}Mutation`;

export type PrefixUseString<T> = {
  [Key in keyof T as Key extends string ? HookType<Key> : never]: T[Key];
};
