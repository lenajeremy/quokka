import { createApi } from 'quokkajs'

export type Post = {
  id: number
  userId: number
  title: string
  body: string
}

export const postsApi = createApi({
  apiName: 'postsApi',
  baseUrl: 'http://localhost:3001',
  endpoints: (builder) => ({
    getPosts: builder.query<void, Post[]>(() => ({
      url: '/posts',
      params: { _limit: '8' },
    })),
    searchPosts: builder.query<string, Post[]>((query) => ({
      url: '/posts',
      params: { title_like: query, _limit: '10' },
    })),
    getPost: builder.query<number, Post>((id) => ({
      url: `/posts/${id}`,
    })),
  }),
})

export const { useGetPostsQuery, useSearchPostsQuery, useGetPostQuery } =
  postsApi.actions
