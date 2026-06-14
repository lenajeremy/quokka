export type AnyFunction = Function;
// export type BuilderObj = Record<string, AnyFunction>;
/**
 * `QueryHookType<T>` describes the `type` of a custom query hook that been created from a given function name
 * */
export type QueryHookType<T extends string = string> =
  `use${Capitalize<T>}Query`;

/**
 * `MutationHookType<T>` describes the `type` of a custom mutation hook that been created from a given function name
 * */
export type MutationHookType<T extends string = string> =
  `use${Capitalize<T>}Mutation`;

export type TagObject<Tags> = {
  name: Tags;
  id: string | number | object | boolean | symbol;
};
export type TagTypeArray<Tags> = Array<Tags | TagObject<Tags>>;
export type TagTypeFn<Tags, Returns> = (
  res: Returns | undefined,
) => TagTypeArray<Tags>;
export type TagType<Tags, Returns> =
  | TagTypeArray<Tags>
  | TagTypeFn<Tags, Returns>;

export function isArrayTag<T, R>(tag: TagType<T, R>): tag is TagTypeArray<T> {
  return Array.isArray(tag);
}

export function isFunctionTag<T, R>(
  tag: TagType<T, R>,
): tag is TagTypeFn<T, R> {
  return !isArrayTag(tag);
}

export * from "./fetch";
export * from "./quokka";

