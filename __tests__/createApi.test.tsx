import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { createApi } from "../src/main";
import { QuokkaProvider } from "../src/context";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QuokkaProvider getState={() => { }}>
    {children}
  </QuokkaProvider>
)

// ─── Hook name derivation ─────────────────────────────────────────────────────

describe("createApi — hook name derivation", () => {
  it("generates useXxxQuery for query endpoints", () => {
    const api = createApi({
      apiName: "nameApi1",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        getUsers: b.query<void, any[]>(() => ({ url: "/users" })),
        fetchPost: b.query<number, any>((id) => ({ url: `/posts/${id}` })),
      }),
    });
    expect(typeof api.actions.useGetUsersQuery).toBe("function");
    expect(typeof api.actions.useFetchPostQuery).toBe("function");
  });

  it("generates useXxxMutation for mutation endpoints", () => {
    const api = createApi({
      apiName: "nameApi2",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        createUser: b.mutation<{ name: string }, any>((body) => ({ url: "/users", method: "POST", body })),
        deletePost: b.mutation<{ id: number }, void>((a) => ({ url: `/posts/${a.id}`, method: "DELETE" })),
      }),
    });
    expect(typeof api.actions.useCreateUserMutation).toBe("function");
    expect(typeof api.actions.useDeletePostMutation).toBe("function");
  });

  it("exposes all endpoints in actions", () => {
    const api = createApi({
      apiName: "nameApi3",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        listItems: b.query<void, any[]>(() => ({ url: "/items" })),
        addItem: b.mutation<{ name: string }, any>((body) => ({ url: "/items", method: "POST", body })),
      }),
    });
    const keys = Object.keys(api.actions);
    expect(keys).toContain("useListItemsQuery");
    expect(keys).toContain("useAddItemMutation");
    expect(keys).toHaveLength(2);
  });
});

// ─── useXxxQuery ─────────────────────────────────────────────────────────────

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
    await act(async () => { try { await result.current.trigger(99); } catch { } });

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

// ─── useXxxMutation ───────────────────────────────────────────────────────────

describe("useXxxMutation", () => {
  beforeEach(() => { vi.stubGlobal("fetch", vi.fn()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("starts with loading=false and no data", () => {
    const api = createApi({
      apiName: "mutA",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        createItem: b.mutation<{ name: string }, any>((body) => ({ url: "/items", method: "POST", body })),
      }),
    });
    const { result } = renderHook(() => api.actions.useCreateItemMutation(), { wrapper });
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it("trigger POSTs and returns the response", async () => {
    const response = { id: 99, name: "New" };
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(response), { status: 201 }));

    const api = createApi({
      apiName: "mutB",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        createItem: b.mutation<{ name: string }, any>((body) => ({ url: "/items", method: "POST", body })),
      }),
    });

    const { result } = renderHook(() => api.actions.useCreateItemMutation(), { wrapper });
    let returned: any;
    await act(async () => { returned = await result.current.trigger({ name: "New" }); });

    expect(returned).toEqual(response);
    expect(result.current.data).toEqual(response);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost/items",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("serialises the body as JSON", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

    const api = createApi({
      apiName: "mutC",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        doThing: b.mutation<{ x: number }, any>((body) => ({ url: "/thing", method: "POST", body })),
      }),
    });

    const { result } = renderHook(() => api.actions.useDoThingMutation(), { wrapper });
    await act(async () => { await result.current.trigger({ x: 42 }); });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect((init as RequestInit).body).toBe(JSON.stringify({ x: 42 }));
  });

  it("sets error on a non-ok response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Bad request" }), { status: 400 }),
    );

    const api = createApi({
      apiName: "mutD",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        doThing: b.mutation<void, any>(() => ({ url: "/thing", method: "POST" })),
      }),
    });

    const { result } = renderHook(() => api.actions.useDoThingMutation(), { wrapper });
    await act(async () => { try { await result.current.trigger(undefined); } catch { } });

    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });
});

// ─── prepareHeaders ───────────────────────────────────────────────────────────

describe("prepareHeaders", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("injects headers into every request", async () => {
    const api = createApi({
      apiName: "headersA",
      baseUrl: "http://localhost",
      prepareHeaders: (_gs, h) => { h.set("X-Api-Key", "secret"); return h; },
      endpoints: (b) => ({ getData: b.query<void, any>(() => ({ url: "/data" })) }),
    });

    const { result } = renderHook(() => api.actions.useGetDataQuery(undefined), { wrapper });
    await act(async () => { await result.current.trigger(undefined); });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect((init?.headers as Headers).get("X-Api-Key")).toBe("secret");
  });

  it("reads from the store via getState", async () => {
    const authWrapper = ({ children }: { children: React.ReactNode }) => (
      <QuokkaProvider getState={() => ({ token: 'store-token' })}>
        {children}
      </QuokkaProvider>
    )

    const api = createApi({
      apiName: "headersB",
      baseUrl: "http://localhost",
      prepareHeaders: (gs, h) => {
        const state = gs<{ token: string }>();
        h.set("Authorization", `Bearer ${state.token}`);
        return h;
      },
      endpoints: (b) => ({ getData: b.query<void, any>(() => ({ url: "/data" })) }),
    });

    const { result } = renderHook(() => api.actions.useGetDataQuery(undefined), { wrapper: authWrapper });
    await act(async () => { await result.current.trigger(undefined); });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect((init?.headers as Headers).get("Authorization")).toBe("Bearer store-token");
  });
});

// ─── Cache invalidation ───────────────────────────────────────────────────────

describe("cache invalidation", () => {
  beforeEach(() => { vi.stubGlobal("fetch", vi.fn()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("mutation with invalidatesTags triggers query refetch", async () => {
    const initial = [{ id: 1 }];
    const created = { id: 2 };
    const updated = [{ id: 1 }, { id: 2 }];

    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(initial), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(created), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(updated), { status: 200 }));

    const api = createApi({
      apiName: "invalidA",
      baseUrl: "http://localhost",
      tags: ["items"],
      endpoints: (b) => ({
        getItems: b.query<void, any[]>(
          () => ({ url: "/items" }),
          { providesTags: ["items"] },
        ),
        createItem: b.mutation<{ name: string }, any>(
          (body) => ({ url: "/items", method: "POST", body }),
          { invalidatesTags: ["items"] },
        ),
      }),
    });

    const { result: q } = renderHook(
      () => api.actions.useGetItemsQuery(undefined, { fetchOnRender: true }),
      { wrapper },
    );
    await waitFor(() => expect(q.current.data).toEqual(initial));

    const { result: m } = renderHook(() => api.actions.useCreateItemMutation(), { wrapper });
    await act(async () => { await m.current.trigger({ name: "New" }); });

    await waitFor(() => expect(q.current.data).toEqual(updated));
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("function invalidatesTags passes mutation response to the resolver", async () => {
    const item = { id: 5, title: "Original" };
    const patched = { id: 5, title: "Updated" };

    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(item), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(patched), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(patched), { status: 200 }));

    const api = createApi({
      apiName: "invalidB",
      baseUrl: "http://localhost",
      tags: ["items"],
      endpoints: (b) => ({
        getItem: b.query<number, any>(
          (id) => ({ url: `/items/${id}` }),
          { providesTags: (res) => (res ? [{ name: "items", id: res.id }] : []) },
        ),
        updateItem: b.mutation<{ id: number; title: string }, any>(
          ({ id, ...body }) => ({ url: `/items/${id}`, method: "PATCH", body }),
          { invalidatesTags: (res) => (res ? [{ name: "items", id: res.id }] : []) },
        ),
      }),
    });

    const { result: q } = renderHook(
      () => api.actions.useGetItemQuery(5, { fetchOnRender: true }),
      { wrapper },
    );
    await waitFor(() => expect(q.current.data).toEqual(item));

    const { result: m } = renderHook(() => api.actions.useUpdateItemMutation(), { wrapper });
    await act(async () => { await m.current.trigger({ id: 5, title: "Updated" }); });

    await waitFor(() => expect(q.current.data).toEqual(patched));
  });

  it("call-time invalidates option also triggers refetch", async () => {
    const initial = [{ id: 1 }];
    const response = { ok: true };
    const refetched = [{ id: 1 }, { id: 2 }];

    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(initial), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(response), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(refetched), { status: 200 }));

    const api = createApi({
      apiName: "invalidC",
      baseUrl: "http://localhost",
      tags: ["items"],
      endpoints: (b) => ({
        getItems: b.query<void, any[]>(
          () => ({ url: "/items" }),
          { providesTags: ["items"] },
        ),
        doAction: b.mutation<void, any>(
          () => ({ url: "/action", method: "POST" }),
        ),
      }),
    });

    const { result: q } = renderHook(
      () => api.actions.useGetItemsQuery(undefined, { fetchOnRender: true }),
      { wrapper },
    );
    await waitFor(() => expect(q.current.data).toEqual(initial));

    const { result: m } = renderHook(
      () => api.actions.useDoActionMutation({ invalidates: ["items"] }),
      { wrapper },
    );
    await act(async () => { await m.current.trigger(undefined); });

    await waitFor(() => expect(q.current.data).toEqual(refetched));
  });

  it("non-matching tags do not trigger a refetch", async () => {
    const initial = [{ id: 1 }];
    const mutResponse = { ok: true };

    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(initial), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(mutResponse), { status: 200 }));

    const api = createApi({
      apiName: "invalidD",
      baseUrl: "http://localhost",
      tags: ["items", "posts"],
      endpoints: (b) => ({
        getItems: b.query<void, any[]>(
          () => ({ url: "/items" }),
          { providesTags: ["items"] },
        ),
        doUnrelated: b.mutation<void, any>(
          () => ({ url: "/posts", method: "POST" }),
          { invalidatesTags: ["posts"] },
        ),
      }),
    });

    const { result: q } = renderHook(
      () => api.actions.useGetItemsQuery(undefined, { fetchOnRender: true }),
      { wrapper },
    );
    await waitFor(() => expect(q.current.data).toEqual(initial));

    const { result: m } = renderHook(() => api.actions.useDoUnrelatedMutation(), { wrapper });
    await act(async () => { await m.current.trigger(undefined); });

    // Only 2 fetches — initial query + mutation. No refetch.
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(q.current.data).toEqual(initial);
  });

  it("mutation with no invalidatesTags and no call-time invalidates leaves cache untouched", async () => {
    const initial = [{ id: 1 }];
    const mutResponse = { created: true };

    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(initial), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(mutResponse), { status: 200 }));

    const api = createApi({
      apiName: "invalidE",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        getItems: b.query<void, any[]>(
          () => ({ url: "/items" }),
          { providesTags: ["items"] },
        ),
        doThing: b.mutation<void, any>(
          () => ({ url: "/thing", method: "POST" }),
          // no invalidatesTags
        ),
      }),
    });

    const { result: q } = renderHook(
      () => api.actions.useGetItemsQuery(undefined, { fetchOnRender: true }),
      { wrapper },
    );
    await waitFor(() => expect(q.current.data).toEqual(initial));

    const { result: m } = renderHook(() => api.actions.useDoThingMutation(), { wrapper });
    await act(async () => { await m.current.trigger(undefined); });

    // Only 2 fetches — no refetch triggered.
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(q.current.data).toEqual(initial);
  });
});

// ─── debouncedDuration ────────────────────────────────────────────────────────

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

    // rapid changes — all within debounce window
    act(() => { rerender({ q: "ab" }); });
    act(() => { rerender({ q: "abc" }); });
    act(() => { rerender({ q: "abcd" }); });

    expect(fetch).not.toHaveBeenCalled();

    // wait for debounce to settle and fetch to fire
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1), { timeout: 300 });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("q=abcd"),
      expect.any(Object),
    );
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

    // should not have fired yet immediately after rerender
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
    // reset before window closes
    await new Promise((r) => setTimeout(r, 60));
    act(() => { rerender({ q: "abc" }); });

    // 60ms after last change — still within debounce window
    expect(fetch).not.toHaveBeenCalled();

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1), { timeout: 300 });

    // only the final args were sent
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("q=abc"),
      expect.any(Object),
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
