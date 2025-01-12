import { TagType } from "./types";
import { QuokkaApiQueryParams } from "./types/quokka";
export declare class CacheEntry<Tags> {
    readonly id: string;
    readonly name: string;
    result: any;
    readonly params: QuokkaApiQueryParams<Tags>;
    readonly payload: any;
    readonly tags: TagType<Tags>;
    isValid: boolean;
    constructor(id: string, name: string, params: QuokkaApiQueryParams<Tags>, payload: any, result: any, tags: TagType<Tags>);
}
type ApiEntries<T> = Record<string, Array<CacheEntry<T>>>;
export declare class CacheManager {
    private _apis;
    constructor();
    get apis(): ApiEntries<any>;
    get<Returns, Tag>(apiName: string, nameOfHook: string, key: string, tags?: TagType<Tag>): Returns | undefined;
    update<Tag>(apiName: string, nameOfHook: string, key: string, tags: TagType<Tag>, data: any, params: QuokkaApiQueryParams<Tag>, payload: any): void;
}
export {};
