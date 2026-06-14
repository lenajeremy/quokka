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

// ─── refetchOnFocus ───────────────────────────────────────────────────────────

describe("refetchOnFocus", () => {
  beforeEach(() => { vi.stubGlobal("fetch", vi.fn()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("re-fires the query when the window gains focus and the cache has expired", async () => {
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify([1]), { status: 200 })),
    );

    const api = createApi({
      apiName: "focusA",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        getItems: b.query<void, number[]>(() => ({ url: "/items" })),
      }),
    });

    renderHook(
      () => api.actions.useGetItemsQuery(undefined, {
        fetchOnRender: true,
        refetchOnFocus: true,
        ttl: 0, // immediately expired — every focus triggers a network request
      }),
      { wrapper },
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    act(() => { window.dispatchEvent(new Event("focus")); });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  });

  it("does not refetch when the cache entry is still valid (TTL not expired)", async () => {
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify([1]), { status: 200 })),
    );

    const api = createApi({
      apiName: "focusB",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        getItems: b.query<void, number[]>(() => ({ url: "/items" })),
      }),
    });

    renderHook(
      () => api.actions.useGetItemsQuery(undefined, {
        fetchOnRender: true,
        refetchOnFocus: true,
        ttl: 60_000, // 60 second TTL — not going to expire
      }),
      { wrapper },
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // Focus within TTL — should serve from cache, no network request
    act(() => { window.dispatchEvent(new Event("focus")); });
    await new Promise((r) => setTimeout(r, 50));

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("refetches after the TTL expires", async () => {
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify([1]), { status: 200 })),
    );

    const api = createApi({
      apiName: "focusC",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        getItems: b.query<void, number[]>(() => ({ url: "/items" })),
      }),
    });

    renderHook(
      () => api.actions.useGetItemsQuery(undefined, {
        fetchOnRender: true,
        refetchOnFocus: true,
        ttl: 80, // expires after 80ms
      }),
      { wrapper },
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // Wait for TTL to expire, then focus
    await new Promise((r) => setTimeout(r, 100));
    act(() => { window.dispatchEvent(new Event("focus")); });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  });

  it("never refetches on focus when ttl is -1", async () => {
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify([1]), { status: 200 })),
    );

    const api = createApi({
      apiName: "focusD",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        getItems: b.query<void, number[]>(() => ({ url: "/items" })),
      }),
    });

    renderHook(
      () => api.actions.useGetItemsQuery(undefined, {
        fetchOnRender: true,
        refetchOnFocus: true,
        ttl: -1,
      }),
      { wrapper },
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    act(() => { window.dispatchEvent(new Event("focus")); });
    act(() => { window.dispatchEvent(new Event("focus")); });
    act(() => { window.dispatchEvent(new Event("focus")); });

    await new Promise((r) => setTimeout(r, 50));
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

// ─── refetchOnConnection ──────────────────────────────────────────────────────

describe("refetchOnConnection", () => {
  beforeEach(() => { vi.stubGlobal("fetch", vi.fn()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("re-fires the query when the browser comes back online and the cache has expired", async () => {
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify([1]), { status: 200 })),
    );

    const api = createApi({
      apiName: "connA",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        getItems: b.query<void, number[]>(() => ({ url: "/items" })),
      }),
    });

    renderHook(
      () => api.actions.useGetItemsQuery(undefined, {
        fetchOnRender: true,
        refetchOnConnection: true,
        ttl: 0, // immediately expired
      }),
      { wrapper },
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    act(() => { window.dispatchEvent(new Event("online")); });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  });

  it("does not refetch on online when the cache is still valid", async () => {
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify([1]), { status: 200 })),
    );

    const api = createApi({
      apiName: "connB",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        getItems: b.query<void, number[]>(() => ({ url: "/items" })),
      }),
    });

    renderHook(
      () => api.actions.useGetItemsQuery(undefined, {
        fetchOnRender: true,
        refetchOnConnection: true,
        ttl: 60_000,
      }),
      { wrapper },
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    act(() => { window.dispatchEvent(new Event("online")); });
    await new Promise((r) => setTimeout(r, 50));

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("removes the listener on unmount", async () => {
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify([1]), { status: 200 })),
    );

    const api = createApi({
      apiName: "connC",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        getItems: b.query<void, number[]>(() => ({ url: "/items" })),
      }),
    });

    const { unmount } = renderHook(
      () => api.actions.useGetItemsQuery(undefined, { fetchOnRender: true, refetchOnConnection: true }),
      { wrapper },
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    unmount();

    act(() => { window.dispatchEvent(new Event("online")); });
    await new Promise((r) => setTimeout(r, 50));

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

// ─── pollingInterval ──────────────────────────────────────────────────────────

describe("pollingInterval", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("re-fires the query on the given interval", async () => {
    vi.mocked(fetch).mockImplementation(() => Promise.resolve(new Response(JSON.stringify([1]), { status: 200 })));

    const api = createApi({
      apiName: "pollA",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        getItems: b.query<void, number[]>(() => ({ url: "/items" })),
      }),
    });

    renderHook(
      () => api.actions.useGetItemsQuery(undefined, { fetchOnRender: true, pollingInterval: 1000 }),
      { wrapper },
    );

    await act(async () => { await vi.advanceTimersByTimeAsync(100); });
    expect(fetch).toHaveBeenCalledTimes(1); // initial

    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(fetch).toHaveBeenCalledTimes(2); // poll 1

    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(fetch).toHaveBeenCalledTimes(3); // poll 2
  });

  it("always goes to the network regardless of TTL", async () => {
    vi.mocked(fetch).mockImplementation(() => Promise.resolve(new Response(JSON.stringify([1]), { status: 200 })));

    const api = createApi({
      apiName: "pollB",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        getItems: b.query<void, number[]>(() => ({ url: "/items" })),
      }),
    });

    renderHook(
      () => api.actions.useGetItemsQuery(undefined, {
        fetchOnRender: true,
        pollingInterval: 1000,
        ttl: -1, // cache never expires — poll should still fetch
      }),
      { wrapper },
    );

    await act(async () => { await vi.advanceTimersByTimeAsync(100); });
    expect(fetch).toHaveBeenCalledTimes(1);

    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(fetch).toHaveBeenCalledTimes(2); // poll bypasses ttl: -1
  });

  it("stops polling when the component unmounts", async () => {
    vi.mocked(fetch).mockImplementation(() => Promise.resolve(new Response(JSON.stringify([1]), { status: 200 })));

    const api = createApi({
      apiName: "pollC",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        getItems: b.query<void, number[]>(() => ({ url: "/items" })),
      }),
    });

    const { unmount } = renderHook(
      () => api.actions.useGetItemsQuery(undefined, { fetchOnRender: true, pollingInterval: 1000 }),
      { wrapper },
    );

    await act(async () => { await vi.advanceTimersByTimeAsync(100); });
    expect(fetch).toHaveBeenCalledTimes(1);

    unmount();

    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(fetch).toHaveBeenCalledTimes(1); // no more fetches after unmount
  });
});
