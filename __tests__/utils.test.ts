import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  debounce,
  resolveRequestParameters,
  generateRequestKey,
  hasMatchingTags,
  deepCompare,
} from "../src/utils";

// ─── debounce ────────────────────────────────────────────────────────────────

describe("debounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("does not call the function immediately", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced();
    expect(fn).not.toHaveBeenCalled();
  });

  it("calls the function after the delay", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
  });

  it("resets the timer on each call — only fires once", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced();
    vi.advanceTimersByTime(50);
    debounced();
    vi.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledOnce();
  });

  it("passes arguments through to the wrapped function", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced("hello", 42);
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith("hello", 42);
  });
});

// ─── resolveRequestParameters ────────────────────────────────────────────────

describe("resolveRequestParameters", () => {
  const api = { apiName: "testApi", baseUrl: "http://api.example.com" };
  const getState = () => ({});

  it("combines baseUrl and endpoint path", () => {
    const r = resolveRequestParameters(api, { url: "/users" } as any, getState);
    expect(r.url).toBe("http://api.example.com/users");
  });

  it("strips trailing slash from baseUrl before joining", () => {
    const r = resolveRequestParameters(
      { ...api, baseUrl: "http://api.example.com/" },
      { url: "/users" } as any,
      getState,
    );
    expect(r.url).toBe("http://api.example.com/users");
  });

  it("adds a leading slash to path if missing", () => {
    const r = resolveRequestParameters(api, { url: "users" } as any, getState);
    expect(r.url).toBe("http://api.example.com/users");
  });

  it("appends query params to the URL", () => {
    const r = resolveRequestParameters(
      api,
      { url: "/users", params: { search: "alice", limit: "5" } } as any,
      getState,
    );
    const u = new URL(r.url);
    expect(u.searchParams.get("search")).toBe("alice");
    expect(u.searchParams.get("limit")).toBe("5");
  });

  it("always sets content-type: application/json", () => {
    const r = resolveRequestParameters(api, { url: "/users" } as any, getState);
    expect(r.headers.get("content-type")).toBe("application/json");
  });

  it("calls prepareHeaders and merges the returned headers", () => {
    const apiWithAuth = {
      ...api,
      prepareHeaders: (_gs: any, h: Headers) => {
        h.set("Authorization", "Bearer tok");
        return h;
      },
    };
    const r = resolveRequestParameters(apiWithAuth, { url: "/me" } as any, getState);
    expect(r.headers.get("Authorization")).toBe("Bearer tok");
  });

  it("passes getState into prepareHeaders so it can read store state", () => {
    const captured: any[] = [];
    const apiWithAuth = {
      ...api,
      prepareHeaders: (gs: any, h: Headers) => {
        captured.push(gs());
        return h;
      },
    };
    const customGetState = () => ({ token: "abc" });
    resolveRequestParameters(apiWithAuth, { url: "/me" } as any, customGetState);
    expect(captured[0]).toEqual({ token: "abc" });
  });

  it("carries the body through for mutation params", () => {
    const r = resolveRequestParameters(
      api,
      { url: "/users", method: "POST", body: { name: "Alice" } } as any,
      getState,
    );
    expect((r as any).body).toEqual({ name: "Alice" });
  });
});

// ─── generateRequestKey ──────────────────────────────────────────────────────

describe("generateRequestKey", () => {
  it("returns a hex string", async () => {
    const key = await generateRequestKey({ url: "http://x.com/users", method: "GET" } as any);
    expect(key).toMatch(/^[0-9a-f]+$/);
  });

  it("same params always produce the same key", async () => {
    const p = { url: "http://x.com/users", method: "GET" };
    expect(await generateRequestKey(p as any)).toBe(await generateRequestKey(p as any));
  });

  it("produces the same key regardless of object key order", async () => {
    const k1 = await generateRequestKey({ url: "http://x.com", method: "GET" } as any);
    const k2 = await generateRequestKey({ method: "GET", url: "http://x.com" } as any);
    expect(k1).toBe(k2);
  });

  it("different URLs produce different keys", async () => {
    const k1 = await generateRequestKey({ url: "http://x.com/a", method: "GET" } as any);
    const k2 = await generateRequestKey({ url: "http://x.com/b", method: "GET" } as any);
    expect(k1).not.toBe(k2);
  });
});

// ─── hasMatchingTags ─────────────────────────────────────────────────────────

describe("hasMatchingTags", () => {
  it("returns false when mTags is undefined", () => {
    expect(hasMatchingTags(undefined, ["todos"])).toBe(false);
  });

  it("returns false when qTags is undefined", () => {
    expect(hasMatchingTags(["todos"], undefined)).toBe(false);
  });

  it("returns false when both arrays are empty", () => {
    expect(hasMatchingTags([], [])).toBe(false);
  });

  it("matches identical string tags", () => {
    expect(hasMatchingTags(["todos"], ["todos"])).toBe(true);
  });

  it("returns false for non-matching string tags", () => {
    expect(hasMatchingTags(["todos"], ["posts"])).toBe(false);
  });

  it("matches object tags with the same name and id", () => {
    const tag = { name: "todos" as const, id: 1 };
    expect(hasMatchingTags([tag], [tag])).toBe(true);
  });

  it("returns false for object tags with different ids", () => {
    expect(
      hasMatchingTags(
        [{ name: "todos" as const, id: 1 }],
        [{ name: "todos" as const, id: 2 }],
      ),
    ).toBe(false);
  });

  it("matches when one tag in mTags matches any tag in qTags", () => {
    expect(hasMatchingTags(["posts", "todos"], ["todos", "users"])).toBe(true);
  });

  it("resolves function mTags with res before comparing", () => {
    const mTags = (res: { id: number } | undefined) => [
      { name: "todos" as const, id: res?.id ?? 0 },
    ];
    const qTags = [{ name: "todos" as const, id: 5 }];
    expect(hasMatchingTags(mTags, qTags, { id: 5 })).toBe(true);
    expect(hasMatchingTags(mTags, qTags, { id: 99 })).toBe(false);
  });

  it("resolves function qTags with res before comparing", () => {
    const mTags = [{ name: "items" as const, id: 3 }];
    const qTags = (res: { id: number } | undefined) => [
      { name: "items" as const, id: res?.id ?? 0 },
    ];
    expect(hasMatchingTags(mTags, qTags, { id: 3 })).toBe(true);
    expect(hasMatchingTags(mTags, qTags, { id: 9 })).toBe(false);
  });

  it("resolves both function tags with the same res", () => {
    const fn = (res: { id: number } | undefined) => [
      { name: "items" as const, id: res?.id ?? 0 },
    ];
    expect(hasMatchingTags(fn, fn, { id: 7 })).toBe(true);
  });
});

// ─── deepCompare ─────────────────────────────────────────────────────────────

describe("deepCompare", () => {
  // primitives
  it("returns true for identical primitives", () => {
    expect(deepCompare(1, 1)).toBe(true);
    expect(deepCompare("hello", "hello")).toBe(true);
  });

  it("returns false for different primitives", () => {
    expect(deepCompare(1, 2)).toBe(false);
    expect(deepCompare("a", "b")).toBe(false);
  });

  it("returns false when one side is null/undefined", () => {
    expect(deepCompare(null, { a: 1 })).toBe(false);
    expect(deepCompare({ a: 1 }, null)).toBe(false);
    expect(deepCompare(null, null)).toBe(true);
  });

  it("returns false when comparing primitive to object", () => {
    expect(deepCompare(1 as any, { a: 1 } as any)).toBe(false);
    expect(deepCompare("str" as any, { a: 1 } as any)).toBe(false);
  });

  // plain objects
  it("returns true for deeply equal objects", () => {
    expect(deepCompare({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
  });

  it("returns false for objects with different values", () => {
    expect(deepCompare({ a: 1 }, { a: 2 })).toBe(false);
  });

  it("returns false for objects with different keys", () => {
    expect(deepCompare({ a: 1 }, { b: 1 })).toBe(false);
  });

  it("returns false when one object has more keys", () => {
    expect(deepCompare({ a: 1, b: 2 }, { a: 1 })).toBe(false);
  });

  it("returns true for nested equal objects", () => {
    expect(deepCompare({ a: { b: { c: 3 } } }, { a: { b: { c: 3 } } })).toBe(true);
  });

  it("returns false for nested objects that differ", () => {
    expect(deepCompare({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
  });

  // arrays
  it("returns true for identical arrays", () => {
    expect(deepCompare([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it("returns false for arrays with different lengths", () => {
    expect(deepCompare([1, 2], [1, 2, 3])).toBe(false);
  });

  it("returns false for arrays with different elements", () => {
    expect(deepCompare([1, 2, 3], [1, 2, 4])).toBe(false);
  });

  it("returns false when obj1 is array but obj2 is object", () => {
    expect(deepCompare([1, 2] as any, { 0: 1, 1: 2 } as any)).toBe(false);
  });

  it("returns false when obj1 is object but obj2 is array", () => {
    expect(deepCompare({ 0: 1 } as any, [1] as any)).toBe(false);
  });

  it("handles arrays of objects", () => {
    expect(deepCompare([{ id: 1 }], [{ id: 1 }])).toBe(true);
    expect(deepCompare([{ id: 1 }], [{ id: 2 }])).toBe(false);
  });
});
