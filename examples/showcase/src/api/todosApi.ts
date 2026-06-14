import { createApi } from "quokkajs";

export type Todo = {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
};

export const todosApi = createApi({
  apiName: "todosApi",
  baseUrl: "http://localhost:3001",
  tags: ["todos"],
  endpoints: (builder) => ({
    getTodos: builder.query<string | void, Todo[]>(
      (search) => ({
        url: "/todos",
        params: search ? { search } : {},
      }),
      {
        providesTags: (res) => [
          "todos" as const,
          ...(res?.map((todo) => ({ name: "todos" as const, id: todo.id })) || []),
        ],
      },
    ),

    createTodo: builder.mutation<{ title: string }, Todo>(
      (body) => ({
        url: "/todos",
        method: "POST",
        body,
      }),
      { invalidatesTags: ["todos"] },
    ),

    deleteTodo: builder.mutation<{ id: number }, void>(
      (args) => ({
        url: `/todos/${args.id}`,
        method: "DELETE",
      }),
      { invalidatesTags: ["todos"] },
    ),

    toggleTodo: builder.mutation<{ id: number; completed: boolean }, Todo>(
      (args) => ({
        url: `/todos/${args.id}`,
        method: "PATCH",
        body: { completed: args.completed },
      }),
      { invalidatesTags: (res) => res ? [{ name: "todos", id: res.id }] : ["todos"] },
    ),
  }),
});

export const {
  useGetTodosQuery,
  useCreateTodoMutation,
  useDeleteTodoMutation,
  useToggleTodoMutation,
} = todosApi.actions;
