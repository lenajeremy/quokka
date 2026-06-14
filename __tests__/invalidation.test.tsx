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

    const { result } = renderHook(() => ({
      q: api.actions.useGetItemsQuery(undefined, { fetchOnRender: true }),
      m: api.actions.useCreateItemMutation(),
    }), { wrapper });

    await waitFor(() => expect(result.current.q.data).toEqual(initial));
    await act(async () => { await result.current.m.trigger({ name: "New" }); });
    await waitFor(() => expect(result.current.q.data).toEqual(updated));
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

    const { result } = renderHook(() => ({
      q: api.actions.useGetItemQuery(5, { fetchOnRender: true }),
      m: api.actions.useUpdateItemMutation(),
    }), { wrapper });

    await waitFor(() => expect(result.current.q.data).toEqual(item));
    await act(async () => { await result.current.m.trigger({ id: 5, title: "Updated" }); });
    await waitFor(() => expect(result.current.q.data).toEqual(patched));
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

    const { result } = renderHook(() => ({
      q: api.actions.useGetItemsQuery(undefined, { fetchOnRender: true }),
      m: api.actions.useDoActionMutation({ invalidates: ["items"] }),
    }), { wrapper });

    await waitFor(() => expect(result.current.q.data).toEqual(initial));
    await act(async () => { await result.current.m.trigger(undefined); });
    await waitFor(() => expect(result.current.q.data).toEqual(refetched));
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

    const { result } = renderHook(() => ({
      q: api.actions.useGetItemsQuery(undefined, { fetchOnRender: true }),
      m: api.actions.useDoUnrelatedMutation(),
    }), { wrapper });

    await waitFor(() => expect(result.current.q.data).toEqual(initial));
    await act(async () => { await result.current.m.trigger(undefined); });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result.current.q.data).toEqual(initial);
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
        ),
      }),
    });

    const { result } = renderHook(() => ({
      q: api.actions.useGetItemsQuery(undefined, { fetchOnRender: true }),
      m: api.actions.useDoThingMutation(),
    }), { wrapper });

    await waitFor(() => expect(result.current.q.data).toEqual(initial));
    await act(async () => { await result.current.m.trigger(undefined); });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result.current.q.data).toEqual(initial);
  });
});

describe("tagless query caching", () => {
  beforeEach(() => { vi.stubGlobal("fetch", vi.fn()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("two components under the same provider both get data — only one network request fires", async () => {
    const data = [{ id: 1 }];
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify(data), { status: 200 })),
    );

    const api = createApi({
      apiName: "taglessA",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        getItems: b.query<void, any[]>(() => ({ url: "/items" })),
      }),
    });

    const { result } = renderHook(() => ({
      q1: api.actions.useGetItemsQuery(undefined, { fetchOnRender: true }),
      q2: api.actions.useGetItemsQuery(undefined, { fetchOnRender: true }),
    }), { wrapper });

    await waitFor(() => expect(result.current.q1.data).toEqual(data));
    await waitFor(() => expect(result.current.q2.data).toEqual(data));
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("tagless mutation does not invalidate tagless query", async () => {
    const data = [{ id: 1 }];
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(data), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const api = createApi({
      apiName: "taglessB",
      baseUrl: "http://localhost",
      endpoints: (b) => ({
        getItems: b.query<void, any[]>(() => ({ url: "/items" })),
        doThing: b.mutation<void, any>(() => ({ url: "/thing", method: "POST" })),
      }),
    });

    const { result } = renderHook(() => ({
      q: api.actions.useGetItemsQuery(undefined, { fetchOnRender: true }),
      m: api.actions.useDoThingMutation(),
    }), { wrapper });

    await waitFor(() => expect(result.current.q.data).toEqual(data));
    await act(async () => { await result.current.m.trigger(undefined); });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result.current.q.data).toEqual(data);
  });
});
