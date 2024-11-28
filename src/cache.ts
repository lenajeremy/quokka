type CacheEntry<Tags, FetchFunction, Value> = {
    value: Value;
    fetch: FetchFunction
    tags: Tags
}

class CacheManager {
    private tags: Record<string, string>
    constructor() {
        this.tags = {};
    }
}
