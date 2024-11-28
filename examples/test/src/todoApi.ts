import {createApi} from 'quokka'

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
    tags: ["something interesting", 'hello world', 'user privileges'],
    baseUrl: "http://127.0.0.1:8080/todos",
    endpoints: builder => ({
        getTodos: builder.query<void, ApiResponse<Todo[]>>(() => ({
            url: "/list",
            providesTags: ['something interesting', 'hello world', 'user privileges']
        })),
        createTodo: builder.mutation<Omit<Todo, "id" | "isDone">, ApiResponse<Todo>>((values) => ({
            url: "/create",
            method: "POST",
            body: {
                title: values.title,
                expirationDate: `${values.expirationDate.getDate()}/${values.expirationDate.getMonth() + 1}/${values.expirationDate.getFullYear()}`,
            }
        })),
        markAsDone: builder.mutation<{ id: number }, ApiResponse<Todo>>((todoId) => ({
            url: "/mark-as-done",
            method: "PUT",
            body: todoId
        }))
    })
})

export const {
    useGetTodosQuery,
    useCreateTodoMutation,
    useMarkAsDoneMutation
} = todoApi.actions