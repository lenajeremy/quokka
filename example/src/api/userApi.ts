import { createApi } from "quokka";

type RootState = {
  user: {
    name: string;
    email: string;
    token?: string;
  };
};

type User = {
  name: string;
  email: string;
  role: string;
  timeCreated: Date;
  profile: {
    picture: string;
    bio: string;
    status: "inactive" | "active";
  };
};

const userApi = createApi({
  apiName: "userApi",
  baseUrl: "https://localhost:3000",
  prepareHeaders(state: RootState, headers) {
    if (state.user.token) {
      headers.set("Authorization", `Bearer ${state.user.token}`);
    }
    return headers;
  },
  endpoints: (builder) => ({
    getUserDetails: builder.query<{ userId: string }, User>((args) => ({
      url: `/user/${args.userId}`,
    })),

    updateUserProfile: builder.mutation<
      { name: string; picture: File; password: string; userId: string },
      User
    >((args) => {
      const formData = new FormData();
      formData.append("name", args.name);
      formData.append("password", args.password);
      formData.append("profilePicture", args.picture, args.picture.name);

      return {
        url: `/user/${args.userId}/update`,
        body: formData,
        method: "POST",
      };
    }),

    deleteAccount: builder.mutation<{ userId: string }, boolean>(
      ({ userId }) => {
        return {
          url: `/user/${userId}/delete`,
          method: "DELETE",
        };
      },
    ),
  }),
});

export const {
  useDeleteAccountMutation,
  useGetUserDetailsQuery,
  useUpdateUserProfileMutation,
} = userApi.actions;
