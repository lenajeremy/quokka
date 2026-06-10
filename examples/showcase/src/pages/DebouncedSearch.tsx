import React from 'react'
import { useSearchPostsQuery } from '../api/postsApi'

export default function DebouncedSearch() {
  const [query, setQuery] = React.useState('')
  const [fetchCount, setFetchCount] = React.useState(0)

  const { data: results, loading } = useSearchPostsQuery(query, {
    fetchOnRender: true,
    fetchOnArgsChange: true,
    debouncedDuration: 500,
  })

  React.useEffect(() => {
    if (!loading && results !== undefined) {
      setFetchCount((c) => c + 1)
    }
  }, [results])

  return (
    <div>
      <h1 className="page-title">2. Debounced Search</h1>
      <p className="page-desc">
        Re-fetch automatically when the search input changes, but wait 500ms after the user stops typing before firing the request.
      </p>

      <div className="badges">
        <span className="badge">fetchOnArgsChange</span>
        <span className="badge">debouncedDuration</span>
        <span className="badge">fetchOnRender</span>
      </div>

      <div className="code-block">
        {'const { data, loading } = useSearchPostsQuery(query, {\n'}
        {'  fetchOnRender:    '}
        <span className="code-keyword">true</span>
        {',\n'}
        {'  fetchOnArgsChange: '}
        <span className="code-keyword">true</span>
        {',\n'}
        {'  debouncedDuration: '}
        <span className="code-number">500</span>
        {',  '}
        <span className="code-comment">// waits 500ms after last keystroke</span>
        {'\n}'}
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-label">Fetch count</div>
          <div className="stat-value cyan">{fetchCount}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Results</div>
          <div className="stat-value">{results?.length ?? '—'}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Status</div>
          <div className="stat-value" style={{ fontSize: 14, paddingTop: 4 }}>
            {loading ? (
              <span style={{ color: '#f59e0b' }}>⏳ debouncing…</span>
            ) : (
              <span style={{ color: '#22c55e' }}>✓ ready</span>
            )}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="input-row">
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search post titles… (500ms debounce)"
            autoFocus
          />
        </div>

        {loading && (
          <div className="state-loading">
            <span className="spinner" />
            Searching…
          </div>
        )}

        {!loading && results && results.length === 0 && query && (
          <p style={{ color: '#94a3b8', fontSize: 14, padding: '12px 0' }}>
            No posts matching "{query}"
          </p>
        )}

        {!loading && results && (
          <div className="item-grid">
            {results.map((post) => (
              <div key={post.id} className="item-card">
                <div className="item-card-title">{post.title}</div>
                <div className="item-card-body">{post.body}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
