import React from 'react'
import {
    Todo,
    useCreateTodoMutation,
    useDeleteTodoMutation,
    useGetTodosQuery,
    useMarkAsDoneMutation
} from "./todoApi.ts";
import {QuokkaProvider, useQuokkaContext} from "quokka";
import quokkaImage from '/quokka.svg'

function App() {
    const [search, setSearch] = React.useState("")
    const {data: todos, loading, initLoading, trigger} = useGetTodosQuery(search, {
        fetchOnArgsChange: true,
        fetchOnRender: true,
        debouncedDuration: 500,
        refetchOnFocus: true,
        pollingInterval: 30000,
    })
    const {trigger: createTodo} = useCreateTodoMutation()
    const [todoTitle, setTodoTitle] = React.useState("")
    const [expDate, setExpDate] = React.useState(new Date())
    const {cacheManager} = useQuokkaContext()

    return (
        <div>
            <img src = {quokkaImage} alt = 'alt' />
            {loading && initLoading && <p>Loading...</p>}
            <input onChange={e => setSearch(e.target.value)} value={search}/>
            {todos && (
                <div>
                    {
                        todos.data.map(todo => <Task {...todo} key={todo.id}/>)
                    }
                </div>
            )}
            <button onClick={() => trigger("")}>Get New Todos</button>
            <button onClick={() => {
                console.log(cacheManager)
            }}>Get Cache Manager
            </button>
            <hr/>
            <h3>Create Task</h3>
            <input value={todoTitle} onChange={e => setTodoTitle(e.currentTarget.value)}/>
            <input type="date" value={expDate.toDateString()}
                   onChange={e => setExpDate(e.currentTarget.valueAsDate ? e.currentTarget.valueAsDate : new Date())}/>
            <button onClick={() => createTodo({title: todoTitle, expirationDate: expDate})}>Create Task</button>
        </div>
    )
}

function Task(props: Todo) {
    const {trigger, loading} = useMarkAsDoneMutation()
    const {trigger: deleteTodo} = useDeleteTodoMutation()

    return (
        <div style={{display: 'flex'}}>
            <input type={"checkbox"} checked={props.isDone} onChange={() => trigger({id: props.id})}/>
            <p>{props.title} <small>{loading && "making change.."}</small></p>
            <button style={{background: 'tomato'}} onClick={() => deleteTodo({id: props.id})}>Delete</button>
        </div>
    )
}

export default function Main() {
    return (
        <QuokkaProvider getState={() => {
        }}>
            <App/>
        </QuokkaProvider>
    )
}
