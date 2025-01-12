import {createApi} from 'quokkajs'

export type Todo = {
    id: number
    title: string
    isDone: boolean
    expirationDate: Date
}

export type ApiResponse<T> = {
    data: T,
    message: string,
    success: boolean,
}

const todoApi = createApi({
    apiName: "todoApi",
    tags: ["todos"],
    baseUrl: "http://127.0.0.1:8080/todos",
    endpoints: builder => ({
        getTodos: builder.query<string, ApiResponse<Todo[]>>((search) => ({
            url: "/list",
            params: {
                search,
            }
        }), {providesTags: ['todos']}),
        createTodo: builder.mutation<Omit<Todo, "id" | "isDone">, ApiResponse<Todo>>((values) => ({
            url: "/create",
            method: "POST",
            body: {
                title: values.title,
                expirationDate: `${values.expirationDate.getDate()}/${values.expirationDate.getMonth() + 1}/${values.expirationDate.getFullYear()}`,
            },
        }), {invalidatesTags: ["todos"]}),
        markAsDone: builder.mutation<{ id: number }, ApiResponse<Todo>>((todoId) => ({
            url: "/mark-as-done",
            method: "PUT",
            body: todoId
        }), {invalidatesTags: ['todos']}),
        deleteTodo: builder.mutation<{ id: number }, ApiResponse<Todo>>(todoId => ({
            url: `/delete/${todoId.id}`,
            method: "DELETE",
        }), {invalidatesTags: ['todos']})
    })
})

export const {
    useGetTodosQuery,
    useCreateTodoMutation,
    useMarkAsDoneMutation,
    useDeleteTodoMutation
} = todoApi.actions

