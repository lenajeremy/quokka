import {TagType} from "./types";
import {hasMatchingTags} from "./utils";
import {QuokkaApiQueryParams} from "./types/quokka";

export class CacheEntry<Tags> {
    readonly id: string;
    readonly name: string;
    result: any;
    readonly params: QuokkaApiQueryParams<Tags>;
    readonly payload: any;
    readonly tags: TagType<Tags>;

    constructor(id: string, name: string, params: QuokkaApiQueryParams<Tags>, payload: any, result: any, tags: TagType<Tags>) {
        this.id = id;
        this.name = name;
        this.result = result;
        this.payload = payload;
        this.tags = tags;
        this.params = params;
    }
}

type ApiEntries<T> = Record<string, Array<CacheEntry<T>>>

export class CacheManager {
    private _apis: ApiEntries<any>

    constructor() {
        this._apis = {};
    }

    get apis() {
        return this._apis;
    }

    get<Returns, Tag>(apiName: string, nameOfHook: string, key: string, tags?: TagType<Tag>): Returns | undefined {
        if (!this._apis[apiName]) return
        const entry = this._apis[apiName].find(entry => (
            entry.name === nameOfHook &&
            entry.id === key &&
            hasMatchingTags(tags, entry.tags)
        ))

        console.log(entry)

        if (!entry) return
        return entry.result as Returns;
    }

    update<Tag>(apiName: string, nameOfHook: string, key: string, tags: TagType<Tag>, data: any, params: QuokkaApiQueryParams<Tag>, payload: any) {
        if (!this._apis[apiName]) {
            this._apis[apiName] = []
        }

        let entryIndex = this._apis[apiName].findIndex(entry => (
            entry.name === nameOfHook &&
            entry.id === key &&
            hasMatchingTags(tags, entry.tags)
        ))

        if (entryIndex === -1) {
            let entry = new CacheEntry(key, nameOfHook, params, payload, data, tags)
            this._apis[apiName].push(entry)
        } else {
            this._apis[apiName].at(entryIndex)!.result = data
        }
    }
}