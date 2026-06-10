import { createApi } from "quokkajs";

export type Article = {
  id: number;
  title: string;
  body: string;
  author: string;
  category: string;
  publishedAt: string;
};

export const articlesApi = createApi({
  apiName: "articlesApi",
  baseUrl: "http://localhost:3001",
  tags: ["articles"],
  endpoints: (builder) => ({
    getArticles: builder.query<void, Article[]>(
      () => ({ url: "/articles" }),
      {
        providesTags: (res) =>
          res?.map((a) => ({ name: "articles", id: a.id })) || ["articles"],
      },
    ),

    getArticle: builder.query<number, Article>(
      (id) => ({ url: `/articles/${id}` }),
      {
        providesTags: (res) =>
          res ? [{ name: "articles", id: res.id }] : [],
      },
    ),

    updateArticle: builder.mutation<
      { id: number; title: string; body: string; category: string },
      Article
    >(
      ({ id, ...body }) => ({
        url: `/articles/${id}`,
        method: "PATCH",
        body,
      }),
      {
        invalidatesTags: (res) =>
          res ? [{ name: "articles", id: res.id }] : ["articles"],
      },
    ),
  }),
});

export const { useGetArticlesQuery, useGetArticleQuery, useUpdateArticleMutation } =
  articlesApi.actions;
