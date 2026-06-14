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
      <QuokkaProvider getState={() => ({ token: "store-token" })}>
        {children}
      </QuokkaProvider>
    );

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
