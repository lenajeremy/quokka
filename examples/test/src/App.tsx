import React from 'react'
import {QuokkaProvider} from "../../../src/context.tsx";
import {Todo, useCreateTodoMutation, useGetTodosQuery, useMarkAsDoneMutation} from "./todoApi.ts";

function App() {
    const {data: todos, loading, trigger} = useGetTodosQuery(undefined, {fetchOnRender: true})
    const {trigger: createTodo} = useCreateTodoMutation()
    const [todoTitle, setTodoTitle] = React.useState("")
    const [expDate, setExpDate] = React.useState(new Date())

    return (
        <div>
            <h1>Hello World</h1>
            {loading && <p>Loading...</p>}
            {todos && (
                <div>
                    {
                        todos.data.map(todo => <Task {...todo} key={todo.id}/>)
                    }
                </div>
            )}
            <button onClick={() => trigger()}>Get New Todos</button>
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
    const {trigger, data, loading} = useMarkAsDoneMutation()
    return (
        <div>
            <input type={"checkbox"} checked={props.isDone} onChange={() => trigger({id: props.id})}/>
            <p>{props.title} <small>{loading && "making change.."}</small></p>
            <pre>{JSON.stringify(data, null, 3)}</pre>
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
