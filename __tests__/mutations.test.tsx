import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { createApi } from "../src/main";
import { QuokkaProvider } from "../src/context";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QuokkaProvider getState={() => {}}>
    {children}
  </QuokkaProvider>
);

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
    await act(async () => { try { await result.current.trigger(undefined); } catch {} });

    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });
});
