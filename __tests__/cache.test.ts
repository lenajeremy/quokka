import { describe, it, expect, beforeEach } from "vitest";
import { CacheManager, CacheEntry } from "../src/cache";

// ─── CacheEntry ───────────────────────────────────────────────────────────────

describe("CacheEntry", () => {
  it("initialises with isValid = true", () => {
    const entry = new CacheEntry(
      "key1",
      "useItemsQuery",
      { url: "/items" } as any,
      undefined,
      [1, 2, 3],
      ["items"],
    );
    expect(entry.isValid).toBe(true);
  });

  it("stores result, id, and name", () => {
    const entry = new CacheEntry(
      "key1",
      "useItemsQuery",
      { url: "/items" } as any,
      { search: "foo" },
      { data: true },
      ["items"],
    );
    expect(entry.id).toBe("key1");
    expect(entry.name).toBe("useItemsQuery");
    expect(entry.result).toEqual({ data: true });
    expect(entry.payload).toEqual({ search: "foo" });
  });
});

// ─── CacheManager ────────────────────────────────────────────────────────────

describe("CacheManager", () => {
  let cache: CacheManager;

  beforeEach(() => {
    cache = new CacheManager();
  });

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

    it("returns undefined when isValid is false", () => {
      cache.update("myApi", "useItemsQuery", "k1", ["items"], [1, 2], { url: "/items" } as any, undefined);
      cache.apis["myApi"][0].isValid = false;
      expect(cache.get("myApi", "useItemsQuery", "k1", ["items"])).toBeUndefined();
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
});
