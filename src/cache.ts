import {QuokkaSingleApiContext} from "./types/context";

type CacheEntry<Tags, FetchFunction, Value> = {
    value: Value;
    fetch: FetchFunction
    tags: Tags
}

class CacheManager {
    private apis: Record<string, QuokkaSingleApiContext>
    private tags: string[]

    constructor() {
        this.tags = [];
        this.apis = {};
    }

    get() {

    }

    update() {

    }
}