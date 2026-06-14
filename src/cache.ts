import { TagType } from "./types";
import { matchesCacheEntry } from "./utils";
import { QuokkaApiQueryParams } from "./types/quokka";

const DEFAULT_CACHE_TTL = 30 * 1000;

export class CacheEntry<Tags, Result = any> {
  readonly id: string;
  readonly name: string;
  result: Result;
  readonly params: QuokkaApiQueryParams<Tags, Result>;
  readonly payload: any;
  readonly tags: TagType<Tags, Result>;
  ttl: number;
  protected timeAdded: number;

  constructor(
    id: string,
    name: string,
    params: QuokkaApiQueryParams<Tags, Result>,
    payload: any,
    result: any,
    tags: TagType<Tags, Result>,
    /*
     * Describes the time (in milliseconds) CacheEntries are expected to be valid*/
    ttl?: number,
  ) {
    this.id = id;
    this.name = name;
    this.result = result;
    this.payload = payload;
    this.tags = tags;
    this.params = params;
    this.ttl = ttl ?? DEFAULT_CACHE_TTL;
    this.timeAdded = Date.now();
  }

  get isValid() {
    if (this.ttl < 0) return true;
    return Date.now() - this.timeAdded < this.ttl;
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
    tags: TagType<Tag, Returns>,
  ): Returns | undefined {
    if (!this._apis[apiName]) return;
    const entry = this._apis[apiName].find(
      (entry) =>
        entry.name === nameOfHook &&
        entry.id === key &&
        matchesCacheEntry(tags, entry.tags) &&
        entry.isValid,
    );

    if (!entry) return;
    return entry.result as Returns;
  }

  update<Returns, Tag>(
    apiName: string,
    nameOfHook: string,
    key: string,
    tags: TagType<Tag, Returns>,
    data: Returns,
    params: QuokkaApiQueryParams<Tag, Returns>,
    payload: any,
    ttl?: number,
  ) {
    if (!this._apis[apiName]) {
      this._apis[apiName] = [];
    }

    let entryIndex = this._apis[apiName].findIndex(
      (entry) =>
        entry.name === nameOfHook &&
        entry.id === key &&
        matchesCacheEntry(tags, entry.tags),
    );

    let entry = new CacheEntry(
      key,
      nameOfHook,
      params,
      payload,
      data,
      tags,
      ttl,
    );

    if (entryIndex === -1) {
      this._apis[apiName].push(entry);
    } else {
      this._apis[apiName][entryIndex] = entry;
    }
  }

  delete<Returns, Tag>(
    apiName: string,
    key: string,
  ): CacheEntry<Tag, Returns> | undefined {
    if (!this._apis[apiName]) {
      return;
    }

    let toDelete: CacheEntry<Tag, Returns> | undefined = undefined;

    this._apis[apiName] = this._apis[apiName].filter((cacheEntry) => {
      if (cacheEntry.id === key) {
        toDelete = cacheEntry;
      }
      return cacheEntry.id !== key;
    });

    return toDelete;
  }

  clear() {
    for (let key of Object.keys(this._apis)) {
      this._apis[key] = [];
    }
  }
}
