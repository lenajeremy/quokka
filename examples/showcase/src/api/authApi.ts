import { createApi } from "quokkajs";

export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  avatar: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};

// Unauthenticated API — login only
export const unauthApi = createApi({
  apiName: "unauthApi",
  baseUrl: "http://localhost:3001",
  endpoints: (builder) => ({
    login: builder.mutation<{ email: string; password: string }, LoginResponse>(
      (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    ),
  }),
});

// Authenticated API — reads token from Zustand via getState
export const authApi = createApi({
  apiName: "authApi",
  baseUrl: "http://localhost:3001",
  prepareHeaders: (getState, headers) => {
    const state = getState<{ token: string }>();
    if (state?.token) {
      headers.set("Authorization", `Bearer ${state.token}`);
    }
    return headers;
  },
  endpoints: (builder) => ({
    getMe: builder.query<void, User>(() => ({
      url: "/auth/me",
    })),
    logout: builder.mutation<void, { message: string }>(() => ({
      url: "/auth/logout",
      method: "POST",
    })),
  }),
});

export const { useLoginMutation } = unauthApi.actions;
export const { useGetMeQuery, useLogoutMutation } = authApi.actions;
