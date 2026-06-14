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

describe("useXxxQuery", () => {
  beforeEach(() => { vi.stubGlobal("fetch", vi.fn()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("starts with loading=false and no data", () => {
    const api = createApi({
      apiName: "queryA",
      baseUrl: "http://localhost",
      endpoints: (b) => ({ getItems: b.query<void, any[]>(() => ({ url: "/items" })) }),
    });
    const { result } = renderHook(() => api.actions.useGetItemsQuery(undefined), { wrapper });
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it("fetchOnRender fires a request on mount and sets data", async () => {
    const mockData = [{ id: 1 }];
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(mockData), { status: 200 }));

    const api = createApi({
      apiName: "queryB",
      baseUrl: "http://localhost",
      endpoints: (b) => ({ getItems: b.query<void, any[]>(() => ({ url: "/items" })) }),
    });

    const { result } = renderHook(
      () => api.actions.useGetItemsQuery(undefined, { fetchOnRender: true }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.data).toEqual(mockData));
    expect(fetch).toHaveBeenCalledWith("http://localhost/items", expect.any(Object));
  });

  it("manual trigger fetches and sets data", async () => {
    const mockData = { id: 1, title: "Hello" };
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(mockData), { status: 200 }));

    const api = createApi({
      apiName: "queryC",
      baseUrl: "http://localhost",
      endpoints: (b) => ({ getPost: b.query<number, any>((id) => ({ url: `/posts/${id}` })) }),
    });

    const { result } = renderHook(() => api.actions.useGetPostQuery(1), { wrapper });
    await act(async () => { await result.current.trigger(1); });

    expect(result.current.data).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith("http://localhost/posts/1", expect.any(Object));
  });

  it("sets loading=true while in-flight and false after", async () => {
    let resolve!: (v: any) => void;
    vi.mocked(fetch).mockReturnValueOnce(new Promise((r) => { resolve = r; }) as any);

    const api = createApi({
      apiName: "queryD",
      baseUrl: "http://localhost",
      endpoints: (b) => ({ getItems: b.query<void, any[]>(() => ({ url: "/items" })) }),
    });

    const { result } = renderHook(() => api.actions.useGetItemsQuery(undefined), { wrapper });

    act(() => { result.current.trigger(undefined); });
    await waitFor(() => expect(result.current.loading).toBe(true));

    resolve(new Response(JSON.stringify([]), { status: 200 }));
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("sets error on a non-ok response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Not found" }), { status: 404 }),
    );

    const api = createApi({
      apiName: "queryE",
      baseUrl: "http://localhost",
      endpoints: (b) => ({ getItem: b.query<number, any>((id) => ({ url: `/items/${id}` })) }),
    });

    const { result } = renderHook(() => api.actions.useGetItemQuery(99), { wrapper });
    await act(async () => { try { await result.current.trigger(99); } catch {} });

    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });

  it("builds the URL with query params from the endpoint", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));

    const api = createApi({
      apiName: "queryF",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        search: b.query<string, any[]>((q) => ({ url: "/search", params: { q } })),
      }),
    });

    const { result } = renderHook(() => api.actions.useSearchQuery("hello"), { wrapper });
    await act(async () => { await result.current.trigger("hello"); });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost/search?q=hello",
      expect.any(Object),
    );
  });
});
