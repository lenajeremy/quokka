import { describe, it, expect } from "vitest";
import { createApi } from "../src/main";

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
