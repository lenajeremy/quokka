import {TagType} from "./types";

export type CacheEntry<Tags extends string> = {
    id: string;
    name: string;
    payload: any;
    tags: TagType<Tags>;
}

type ApiEntries<T extends string> = Record<string, Array<CacheEntry<T>>>

export class CacheManager {
    private apis: ApiEntries<string>

    constructor() {
        this.apis = {};
    }

    get() {

    }

    update() {

    }
}