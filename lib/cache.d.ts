import { TagType } from "./types";
import { QuokkaApiQueryParams } from "./types/quokka";
export declare class CacheEntry<Tags, Result = any> {
    readonly id: string;
    readonly name: string;
    result: Result;
    readonly params: QuokkaApiQueryParams<Tags, Result>;
    readonly payload: any;
    readonly tags: TagType<Tags, Result>;
    isValid: boolean;
    constructor(id: string, name: string, params: QuokkaApiQueryParams<Tags, Result>, payload: any, result: any, tags: TagType<Tags, Result>);
}
type ApiEntries<T> = Record<string, Array<CacheEntry<T>>>;
export declare class CacheManager {
    private _apis;
    constructor();
    get apis(): ApiEntries<any>;
    get<Returns, Tag>(apiName: string, nameOfHook: string, key: string, tags?: TagType<Tag, Returns>): Returns | undefined;
    update<Tag, Data = any>(apiName: string, nameOfHook: string, key: string, tags: TagType<Tag, Data>, data: Data, params: QuokkaApiQueryParams<Tag, Data>, payload: any): void;
}
export {};
