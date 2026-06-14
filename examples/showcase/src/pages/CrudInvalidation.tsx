import React from 'react'
import {
  useGetTodosQuery,
  useCreateTodoMutation,
  useDeleteTodoMutation,
  useToggleTodoMutation,
} from '../api/todosApi'

export default function CrudInvalidation() {
  const [newTitle, setNewTitle] = React.useState('')
  const [refetchCount, setRefetchCount] = React.useState(0)

  const { data: todos, loading, initLoading } = useGetTodosQuery(undefined, {
    fetchOnRender: true,
  })

  const { trigger: createTodo, loading: creating } = useCreateTodoMutation()
  const { trigger: deleteTodoTrigger } = useDeleteTodoMutation()
  const { trigger: toggleTodo } = useToggleTodoMutation()

  React.useEffect(() => {
    if (!loading && todos) {
      setRefetchCount((c) => c + 1)
    }
  }, [todos])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    await createTodo({ title: newTitle.trim() })
    setNewTitle('')
  }

  return (
    <div>
      <h1 className="page-title">3. CRUD + Cache Invalidation</h1>
      <p className="page-desc">
        Every mutation (<code>create</code>, <code>toggle</code>, <code>delete</code>) declares <code>invalidatesTags: ['todos']</code>.
        When any of them succeed, <code>useGetTodosQuery</code> re-fetches automatically — watch the fetch count increment.
      </p>

      <div className="badges">
        <span className="badge">providesTags</span>
        <span className="badge">invalidatesTags</span>
        <span className="badge">call-time invalidates</span>
        <span className="badge">auto-refetch</span>
      </div>

      <div className="code-block">
        <span className="code-comment">// Query provides per-item tags</span>{'\n'}
        {'getTodos: builder.query(..., {\n'}
        {'  providesTags: (res) => res?.map(t => ({ name: '}
        <span className="code-string">'todos'</span>
        {', id: t.id }))\n'}
        {'})\n\n'}
        <span className="code-comment">// createTodo: endpoint-level invalidation</span>{'\n'}
        {'createTodo: builder.mutation(..., { invalidatesTags: ['}
        <span className="code-string">'todos'</span>
        {'] })\n\n'}
        <span className="code-comment">// deleteTodo: per-call invalidation at the trigger site</span>{'\n'}
        {'deleteTodoTrigger({ id }, { invalidates: [{ name: '}
        <span className="code-string">'todos'</span>
        {', id }] })'}
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-label">Query re-fetches</div>
          <div className="stat-value cyan">{refetchCount}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Todos loaded</div>
          <div className="stat-value">{todos?.length ?? '—'}</div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Create todo</div>
        <form onSubmit={handleCreate}>
          <div className="input-row">
            <input
              className="input"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Todo title…"
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating || !newTitle.trim()}
              style={{ whiteSpace: 'nowrap' }}
            >
              {creating ? 'Creating…' : '+ Create'}
            </button>
          </div>
        </form>
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: -8, marginBottom: 20 }}>
          Note: JSONPlaceholder simulates CRUD — it returns a correct response but doesn't persist data.
          The query still re-fetches after each mutation, which is the behaviour being demonstrated.
        </p>
      </div>

      <div className="section">
        <div className="section-title">Todo list</div>

        {initLoading && loading && (
          <div className="state-loading">
            <span className="spinner" />
            Loading todos…
          </div>
        )}

        {!initLoading && loading && (
          <div className="state-loading">
            <span className="spinner" />
            Refetching after mutation…
          </div>
        )}

        {todos && !loading && todos.map((todo) => (
          <div key={todo.id} className={`todo-item ${todo.completed ? 'done' : ''}`}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo({ id: todo.id, completed: !todo.completed })}
              style={{ cursor: 'pointer', width: 16, height: 16 }}
            />
            <span className="todo-title">{todo.title}</span>
            <span className="todo-id">#{todo.id}</span>
            <button
              className="btn btn-danger"
              onClick={() => deleteTodoTrigger({ id: todo.id }, { invalidates: [{ name: 'todos', id: todo.id }] })}
              style={{ padding: '4px 10px', fontSize: 12 }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
