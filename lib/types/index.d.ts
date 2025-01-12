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
    key: Tags;
    id: string | number | object | boolean | symbol;
};
export type TagType<Tags> = readonly (Tags | TagObject<Tags> | ((res?: any) => Tags) | ((res?: any) => TagObject<Tags>))[];
export * from './context';
export * from './fetch';
export * from './quokka';
