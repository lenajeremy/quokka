// import { assertEquals } from "";
// import { createBuilder } from "../src/builder.ts";

// const builderParams = {
//   fetchUser: (id: string) => {
//     console.log(id);
//     return {
//       name: "jeremiah",
//       id,
//     };
//   },
//   updateUserDetails: (id: string, newDetails: { name: string }) => {
//     console.log("Updating user with ID:", id, "to", JSON.stringify(newDetails));
//     return {
//       id,
//       ...newDetails,
//     };
//   },
//   login: (email: string, password: string) => {
//     console.log({ email, password });
//     return {
//       status: 200,
//       email,
//       message: "logged in successfully",
//     };
//   },
// };

// Deno.test(function TestBuilderCreatesObjectWithCorrectHooks() {
//   const res = createBuilder(builderParams);
//   assertEquals("useUpdateUserDetailsQuery" in res, true);
//   assertEquals("useFetchUserQuery" in res, true);
//   assertEquals("useLoginQuery" in res, true);
// });

// Deno.test(function TestBuilderHooksRunsCorrectFunction() {
//   const res = createBuilder(builderParams);
//   assertEquals(res.useFetchUserQuery("100"), { name: "jeremiah", id: "100" });
//   assertEquals(res.useLoginQuery("jeremiah@example.com", "password"), {
//     status: 200,
//     email: "jeremiah@example.com",
//     message: "logged in successfully",
//   });
//   assertEquals(res.useUpdateUserDetailsQuery("100", { name: "Lena" }), { name: "Lena", id: "100" })
// });
