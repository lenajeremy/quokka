import { createApi } from "quokka";

type Post = {
  id: number,
  title: string,
  body: string,
  userId: number
}

const typicodeApi = createApi({
  apiName: "typicodeApi",
  baseUrl: "https://jsonplaceholder.typicode.com",
  prepareHeaders(_, headers) {
    const token = "jeremiah is the boss"
    headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
  endpoints: (builder) => ({
    listAllPosts: builder.query<void, Post[]>(() => ({
      url: "/posts"
    })),
    getPostDetails: builder.query<string, Post>(postId => ({
      url: `/posts/${postId}`
    }))
  })
})

export const {
  useListAllPostsQuery,
  useGetPostDetailsQuery,
} = typicodeApi.actions;
