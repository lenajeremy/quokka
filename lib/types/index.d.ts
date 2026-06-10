export type AnyFunction = Function;
/**
 * `QueryHookType<T>` describes the `type` of a custom query hook that been created from a given function name
 * */
export type QueryHookType<T extends string = string> = `use${Capitalize<T>}Query`;
/**
 * `MutationHookType<T>` describes the `type` of a custom mutation hook that been created from a given function name
 * */
export type MutationHookType<T extends string = string> = `use${Capitalize<T>}Mutation`;
export type TagObject<Tags> = {
    name: Tags;
    id: string | number | object | boolean | symbol;
};
export type TagTypeArray<Tags> = Array<Tags | TagObject<Tags>>;
export type TagTypeFn<Tags, Returns> = (res: Returns | undefined) => TagTypeArray<Tags>;
export type TagType<Tags, Returns> = TagTypeArray<Tags> | TagTypeFn<Tags, Returns>;
export declare function isArrayTag<T, R>(tag: TagType<T, R>): tag is TagTypeArray<T>;
export declare function isFunctionTag<T, R>(tag: TagType<T, R>): tag is TagTypeFn<T, R>;
export * from "./context";
export * from "./fetch";
export * from "./quokka";
