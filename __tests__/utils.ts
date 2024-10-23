import { assertEquals } from "@std/assert";
import { identifierToHook } from "../src/builder.ts";

Deno.test(function convertsIdentifierToValidHook() {
  const identifiers = [
    "getName",
    "fetchDeity",
    "getValidCount",
    "getUserDetails",
  ];
  const expectedHooks = [
    "useGetNameQuery",
    "useFetchDeityQuery",
    "useGetValidCountQuery",
    "useGetUserDetailsQuery",
  ];

  const results = identifiers.map(identifierToHook);

  assertEquals(results, expectedHooks);
});
