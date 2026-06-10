import { TagType } from "./types";
import { hasMatchingTags } from "./utils";
import { QuokkaApiQueryParams } from "./types/quokka";

export class CacheEntry<Tags, Result = any> {
  readonly id: string;
  readonly name: string;
  result: Result;
  readonly params: QuokkaApiQueryParams<Tags, Result>;
  readonly payload: any;
  readonly tags: TagType<Tags, Result>;
  isValid: boolean;

  constructor(
    id: string,
    name: string,
    params: QuokkaApiQueryParams<Tags, Result>,
    payload: any,
    result: any,
    tags: TagType<Tags, Result>,
  ) {
    this.id = id;
    this.name = name;
    this.result = result;
    this.payload = payload;
    this.tags = tags;
    this.params = params;
    this.isValid = true;
  }
}

type ApiEntries<T> = Record<string, Array<CacheEntry<T>>>;

export class CacheManager {
  private _apis: ApiEntries<any>;

  constructor() {
    this._apis = {};
  }

  get apis() {
    return this._apis;
  }

  get<Returns, Tag>(
    apiName: string,
    nameOfHook: string,
    key: string,
    tags?: TagType<Tag, Returns>,
  ): Returns | undefined {
    if (!this._apis[apiName]) return;
    const entry = this._apis[apiName].find(
      (entry) =>
        entry.name === nameOfHook &&
        entry.id === key &&
        hasMatchingTags(tags, entry.tags) &&
        entry.isValid,
    );

    if (!entry) return;
    return entry.result as Returns;
  }

  update<Tag, Data = any>(
    apiName: string,
    nameOfHook: string,
    key: string,
    tags: TagType<Tag, Data>,
    data: Data,
    params: QuokkaApiQueryParams<Tag, Data>,
    payload: any,
  ) {
    if (!this._apis[apiName]) {
      this._apis[apiName] = [];
    }

    let entryIndex = this._apis[apiName].findIndex(
      (entry) =>
        entry.name === nameOfHook &&
        entry.id === key &&
        hasMatchingTags(tags, entry.tags),
    );

    if (entryIndex === -1) {
      let entry = new CacheEntry(key, nameOfHook, params, payload, data, tags);
      this._apis[apiName].push(entry);
    } else {
      this._apis[apiName].at(entryIndex)!.result = data;
    }
  }
}

