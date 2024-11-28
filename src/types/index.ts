export type AnyFunction = Function;
// export type BuilderObj = Record<string, AnyFunction>;
/**
 * `QueryHookType<T>` describes the `type` of a custom query hook that been created from a given function name
 * */
export type QueryHookType<T extends string = string> = `use${Capitalize<T>}Query`;

/**
 * `MutationHookType<T>` describes the `type` of a custom mutation hook that been created from a given function name
 * */
export type MutationHookType<T extends string = string> = `use${Capitalize<T>}Mutation`;

export type TagType<Tags> = readonly (Tags | ((res: any) => Tags))[]