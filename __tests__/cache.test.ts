import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { CacheManager, CacheEntry } from "../src/cache";

// ─── CacheEntry ───────────────────────────────────────────────────────────────

describe("CacheEntry", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("initialises with isValid = true", () => {
    const entry = new CacheEntry("key1", "useItemsQuery", { url: "/items" } as any, undefined, [1, 2, 3], ["items"]);
    expect(entry.isValid).toBe(true);
  });

  it("stores result, id, and name", () => {
    const entry = new CacheEntry("key1", "useItemsQuery", { url: "/items" } as any, { search: "foo" }, { data: true }, ["items"]);
    expect(entry.id).toBe("key1");
    expect(entry.name).toBe("useItemsQuery");
    expect(entry.result).toEqual({ data: true });
    expect(entry.payload).toEqual({ search: "foo" });
  });

  it("isValid becomes false after the default TTL (30s) elapses", () => {
    const entry = new CacheEntry("key1", "useItemsQuery", { url: "/items" } as any, undefined, [], ["items"]);
    vi.advanceTimersByTime(60_000);
    expect(entry.isValid).toBe(false);
  });

  it("isValid stays true well within the default TTL", () => {
    const entry = new CacheEntry("key1", "useItemsQuery", { url: "/items" } as any, undefined, [], ["items"]);
    vi.advanceTimersByTime(10_000);
    expect(entry.isValid).toBe(true);
  });

  it("respects a custom ttl passed to the constructor", () => {
    const entry = new CacheEntry("key1", "useItemsQuery", { url: "/items" } as any, undefined, [], ["items"], 5_000);
    vi.advanceTimersByTime(10_000);
    expect(entry.isValid).toBe(false);
  });

  it("ttl of -1 never expires", () => {
    const entry = new CacheEntry("key1", "useItemsQuery", { url: "/items" } as any, undefined, [], ["items"], -1);
    vi.advanceTimersByTime(Number.MAX_SAFE_INTEGER);
    expect(entry.isValid).toBe(true);
  });
});

// ─── CacheManager ────────────────────────────────────────────────────────────

describe("CacheManager", () => {
  let cache: CacheManager;

  beforeEach(() => {
    cache = new CacheManager();
    vi.useFakeTimers();
  });

  afterEach(() => vi.useRealTimers());

  describe("update", () => {
    it("creates a new api bucket on first write", () => {
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [], { url: "/items" } as any, undefined);
      expect(cache.apis["myApi"]).toHaveLength(1);
    });

    it("adds a new entry for a different key", () => {
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [], { url: "/items" } as any, undefined);
      cache.update("myApi", "useItemsQuery", "k2", ["items"], [], { url: "/items?p=2" } as any, undefined);
      expect(cache.apis["myApi"]).toHaveLength(2);
    });

    it("updates the result of an existing entry in-place", () => {
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [1, 2], { url: "/items" } as any, undefined);
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [3, 4], { url: "/items" } as any, undefined);
      expect(cache.apis["myApi"]).toHaveLength(1);
      expect(cache.apis["myApi"][0].result).toEqual([3, 4]);
    });

    it("stores separate entries for different hook names", () => {
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [], { url: "/items" } as any, undefined);
      cache.update("myApi", "usePostsQuery", "k2", ["posts"], [], { url: "/posts" } as any, undefined);
      expect(cache.apis["myApi"]).toHaveLength(2);
    });

    it("re-writing an existing key resets the TTL", () => {
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [1], { url: "/items" } as any, undefined, 1_000);
      vi.advanceTimersByTime(800);
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [2], { url: "/items" } as any, undefined, 1_000);
      vi.advanceTimersByTime(800);
      // 800 + 800 = 1600ms total, but TTL was reset at 800ms so only 800ms have elapsed since reset
      expect(cache.get("myApi", "useItemsQuery", "k1", ["items"])).toEqual([2]);
    });

    it("stores separate entries for different api names", () => {
      cache.update("apiA", "useItemsQuery", "k1", ["items"], [], { url: "/items" } as any, undefined);
      cache.update("apiB", "useItemsQuery", "k1", ["items"], [], { url: "/items" } as any, undefined);
      expect(cache.apis["apiA"]).toHaveLength(1);
      expect(cache.apis["apiB"]).toHaveLength(1);
    });
  });

  describe("get", () => {
    it("returns the cached result for a matching entry", () => {
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [1, 2, 3], { url: "/items" } as any, undefined);
      const result = cache.get("myApi", "useItemsQuery", "k1", ["items"]);
      expect(result).toEqual([1, 2, 3]);
    });

    it("returns the cached result for a tagless entry (empty providesTags)", () => {
      cache.update("myApi", "useItemsQuery", "k1", [], [1, 2, 3], { url: "/items" } as any, undefined);
      const result = cache.get("myApi", "useItemsQuery", "k1", []);
      expect(result).toEqual([1, 2, 3]);
    });

    it("update replaces an existing tagless entry rather than pushing a duplicate", () => {
      cache.update("myApi", "useItemsQuery", "k1", [], [1], { url: "/items" } as any, undefined);
      cache.update("myApi", "useItemsQuery", "k1", [], [2], { url: "/items" } as any, undefined);
      expect(cache.apis["myApi"]).toHaveLength(1);
      expect(cache.get("myApi", "useItemsQuery", "k1", [])).toEqual([2]);
    });

    it("returns undefined for an unknown api", () => {
      expect(cache.get("noSuchApi", "useItemsQuery", "k1", ["items"])).toBeUndefined();
    });

    it("returns undefined for the wrong key", () => {
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [1, 2], { url: "/items" } as any, undefined);
      expect(cache.get("myApi", "useItemsQuery", "wrong-key", ["items"])).toBeUndefined();
    });

    it("returns undefined for the wrong hook name", () => {
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [1, 2], { url: "/items" } as any, undefined);
      expect(cache.get("myApi", "useOtherQuery", "k1", ["items"])).toBeUndefined();
    });

    it("returns undefined when the entry has expired", () => {
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [1, 2], { url: "/items" } as any, undefined, 1_000);
      vi.advanceTimersByTime(2_000);
      expect(cache.get("myApi", "useItemsQuery", "k1", ["items"])).toBeUndefined();
    });

    it("returns the result when the entry has not yet expired", () => {
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [1, 2], { url: "/items" } as any, undefined, 1_000);
      vi.advanceTimersByTime(500);
      expect(cache.get("myApi", "useItemsQuery", "k1", ["items"])).toEqual([1, 2]);
    });

    it("returns the most recent result after an update", () => {
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [1], { url: "/items" } as any, undefined);
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [2], { url: "/items" } as any, undefined);
      expect(cache.get("myApi", "useItemsQuery", "k1", ["items"])).toEqual([2]);
    });

    it("works with object tags", () => {
      const tags = [{ name: "items" as const, id: 5 }];
      cache.update("myApi", "useItemQuery", "k1", tags, { id: 5 }, { url: "/items/5" } as any, undefined);
      const result = cache.get("myApi", "useItemQuery", "k1", tags);
      expect(result).toEqual({ id: 5 });
    });
  });

  describe("delete", () => {
    it("removes the entry matching the key and returns it", () => {
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [1, 2], { url: "/items" } as any, undefined);
      const deleted = cache.delete("myApi", "k1");
      expect(deleted).toBeDefined();
      expect(deleted!.id).toBe("k1");
      expect(cache.apis["myApi"]).toHaveLength(0);
    });

    it("returns undefined for an unknown api", () => {
      expect(cache.delete("noSuchApi", "k1")).toBeUndefined();
    });

    it("returns undefined when the key does not exist", () => {
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [], { url: "/items" } as any, undefined);
      expect(cache.delete("myApi", "no-such-key")).toBeUndefined();
    });

    it("only removes entries with the matching key, leaving others intact", () => {
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [1], { url: "/items" } as any, undefined);
      cache.update("myApi", "useItemsQuery", "k2", ["items"], [2], { url: "/items?p=2" } as any, undefined);
      cache.delete("myApi", "k1");
      expect(cache.apis["myApi"]).toHaveLength(1);
      expect(cache.apis["myApi"][0].id).toBe("k2");
    });

    it("after deletion get returns undefined for the removed key", () => {
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [1, 2], { url: "/items" } as any, undefined);
      cache.delete("myApi", "k1");
      expect(cache.get("myApi", "useItemsQuery", "k1", ["items"])).toBeUndefined();
    });
  });

  describe("clear", () => {
    it("empties all entries across all apis", () => {
      cache.update("apiA", "useItemsQuery", "k1", ["items"], [], { url: "/items" } as any, undefined);
      cache.update("apiB", "usePostsQuery", "k2", ["posts"], [], { url: "/posts" } as any, undefined);
      cache.clear();
      expect(cache.apis["apiA"]).toHaveLength(0);
      expect(cache.apis["apiB"]).toHaveLength(0);
    });

    it("get returns undefined for all entries after clear", () => {
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [1, 2], { url: "/items" } as any, undefined);
      cache.clear();
      expect(cache.get("myApi", "useItemsQuery", "k1", ["items"])).toBeUndefined();
    });

    it("update works normally after a clear", () => {
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [1], { url: "/items" } as any, undefined);
      cache.clear();
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [99], { url: "/items" } as any, undefined);
      expect(cache.get("myApi", "useItemsQuery", "k1", ["items"])).toEqual([99]);
    });
  });
});
