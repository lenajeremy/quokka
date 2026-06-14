import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { createApi } from "../src/main";
import { QuokkaProvider } from "../src/context";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QuokkaProvider getState={() => {}}>
    {children}
  </QuokkaProvider>
);

describe("debouncedDuration", () => {
  beforeEach(() => { vi.stubGlobal("fetch", vi.fn()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("rapid arg changes fire only one fetch after the debounce window", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));

    const api = createApi({
      apiName: "debounceA",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        search: b.query<string, any[]>((q) => ({ url: "/search", params: { q } })),
      }),
    });

    const { rerender } = renderHook(
      ({ q }: { q: string }) =>
        api.actions.useSearchQuery(q, { fetchOnArgsChange: true, debouncedDuration: 50 }),
      { wrapper, initialProps: { q: "a" } },
    );

    act(() => { rerender({ q: "ab" }); });
    act(() => { rerender({ q: "abc" }); });
    act(() => { rerender({ q: "abcd" }); });

    expect(fetch).not.toHaveBeenCalled();

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1), { timeout: 300 });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("q=abcd"), expect.any(Object));
  });

  it("fetch does not fire until the debounce window has elapsed", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));

    const api = createApi({
      apiName: "debounceB",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        search: b.query<string, any[]>((q) => ({ url: "/search", params: { q } })),
      }),
    });

    const { rerender } = renderHook(
      ({ q }: { q: string }) =>
        api.actions.useSearchQuery(q, { fetchOnArgsChange: true, debouncedDuration: 100 }),
      { wrapper, initialProps: { q: "a" } },
    );

    act(() => { rerender({ q: "ab" }); });
    expect(fetch).not.toHaveBeenCalled();

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1), { timeout: 300 });
  });

  it("each intermediate arg change resets the debounce timer", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));

    const api = createApi({
      apiName: "debounceC",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        search: b.query<string, any[]>((q) => ({ url: "/search", params: { q } })),
      }),
    });

    const { rerender } = renderHook(
      ({ q }: { q: string }) =>
        api.actions.useSearchQuery(q, { fetchOnArgsChange: true, debouncedDuration: 100 }),
      { wrapper, initialProps: { q: "a" } },
    );

    act(() => { rerender({ q: "ab" }); });
    await new Promise((r) => setTimeout(r, 60));
    act(() => { rerender({ q: "abc" }); });

    expect(fetch).not.toHaveBeenCalled();

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1), { timeout: 300 });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("q=abc"), expect.any(Object));
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("in-flight deduplication", () => {
  beforeEach(() => { vi.stubGlobal("fetch", vi.fn()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("two concurrent triggers for the same args fire only one network request", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify([1, 2, 3]), { status: 200 }));

    const api = createApi({
      apiName: "dedupA",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        getItems: b.query<void, any[]>(() => ({ url: "/items" })),
      }),
    });

    const { result } = renderHook(() => api.actions.useGetItemsQuery(undefined), { wrapper });

    await act(async () => {
      await Promise.all([
        result.current.trigger(undefined),
        result.current.trigger(undefined),
      ]);
    });

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("both concurrent callers receive the same resolved value", async () => {
    const data = [{ id: 1 }];
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(data), { status: 200 }));

    const api = createApi({
      apiName: "dedupB",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        getItems: b.query<void, any[]>(() => ({ url: "/items" })),
      }),
    });

    const { result } = renderHook(() => api.actions.useGetItemsQuery(undefined), { wrapper });

    let r1: any, r2: any;
    await act(async () => {
      [r1, r2] = await Promise.all([
        result.current.trigger(undefined),
        result.current.trigger(undefined),
      ]);
    });

    expect(r1).toEqual(data);
    expect(r2).toEqual(data);
  });

  it("a new request fires after the in-flight one completes", async () => {
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify([]), { status: 200 })),
    );

    const api = createApi({
      apiName: "dedupC",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        getItems: b.query<void, any[]>(() => ({ url: "/items" })),
      }),
    });

    const { result } = renderHook(() => api.actions.useGetItemsQuery(undefined), { wrapper });

    await act(async () => { await result.current.trigger(undefined); });
    await act(async () => { await result.current.trigger(undefined); });

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("dedup path clears stale error so a successful dedup does not leave error + data simultaneously", async () => {
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error("network failure"))
      .mockResolvedValue(new Response(JSON.stringify([1]), { status: 200 }));

    const api = createApi({
      apiName: "dedupD",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        getItems: b.query<void, any[]>(() => ({ url: "/items" })),
      }),
    });

    const { result } = renderHook(() => api.actions.useGetItemsQuery(undefined), { wrapper });

    await act(async () => { try { await result.current.trigger(undefined); } catch {} });
    expect(result.current.error).toBeDefined();

    await act(async () => {
      await Promise.all([
        result.current.trigger(undefined),
        result.current.trigger(undefined),
      ]);
    });

    expect(result.current.data).toEqual([1]);
    expect(result.current.error).toBeUndefined();
  });
});
