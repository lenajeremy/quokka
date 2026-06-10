import React from 'react'
import { useGetPostQuery } from '../api/postsApi'

const POLL_INTERVAL = 30000

export default function Polling() {
  const [fetchCount, setFetchCount] = React.useState(0)
  const [lastFetched, setLastFetched] = React.useState<Date | null>(null)
  const [elapsed, setElapsed] = React.useState(0)

  const { data: post, loading } = useGetPostQuery(1, {
    fetchOnRender: true,
    pollingInterval: POLL_INTERVAL,
    refetchOnFocus: true,
  })

  // Track each completed fetch
  React.useEffect(() => {
    if (!loading && post) {
      setFetchCount((c) => c + 1)
      setLastFetched(new Date())
      setElapsed(0)
    }
  }, [post, loading])

  // Tick elapsed seconds since last fetch
  React.useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const nextIn = Math.max(0, Math.round((POLL_INTERVAL / 1000) - elapsed))

  return (
    <div>
      <h1 className="page-title">4. Polling + Focus Refetch</h1>
      <p className="page-desc">
        The query re-fires every {POLL_INTERVAL / 1000}s via <code>pollingInterval</code>,
        and also immediately when the browser window regains focus via <code>refetchOnFocus</code>.
      </p>

      <div className="badges">
        <span className="badge">pollingInterval</span>
        <span className="badge">refetchOnFocus</span>
        <span className="badge">fetchOnRender</span>
      </div>

      <div className="code-block">
        {'const { data, loading } = useGetPostQuery(1, {\n'}
        {'  fetchOnRender:   '}
        <span className="code-keyword">true</span>
        {',\n'}
        {'  pollingInterval: '}
        <span className="code-number">30000</span>
        {',  '}
        <span className="code-comment">// re-fetch every 30 seconds</span>
        {'\n'}
        {'  refetchOnFocus:  '}
        <span className="code-keyword">true</span>
        {',  '}
        <span className="code-comment">// re-fetch on tab focus</span>
        {'\n}'}
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-label">Fetch count</div>
          <div className="stat-value cyan">{fetchCount}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Next poll in</div>
          <div className="stat-value">{loading ? '…' : `${nextIn}s`}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Last fetched</div>
          <div className="stat-value" style={{ fontSize: 14, paddingTop: 6 }}>
            {lastFetched ? lastFetched.toLocaleTimeString() : '—'}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Status</div>
          <div className="stat-value" style={{ fontSize: 14, paddingTop: 6 }}>
            {loading ? (
              <span style={{ color: '#f59e0b' }}>⏳ fetching</span>
            ) : (
              <>
                <span className="pulse-dot" />
                <span style={{ color: '#22c55e', fontSize: 13 }}>live</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ background: '#fffbeb', borderColor: '#fde68a', marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: '#92400e' }}>
          💡 <strong>Try it:</strong> Switch to another browser tab and come back.
          The fetch count will increment immediately when you return — that's <code>refetchOnFocus</code> firing.
        </p>
      </div>

      {loading && fetchCount === 0 && (
        <div className="state-loading">
          <span className="spinner" />
          Initial fetch…
        </div>
      )}

      {post && (
        <div className="card">
          <div className="card-title">Post #{post.id}</div>
          <div className="item-card-title" style={{ fontSize: 16, marginBottom: 10 }}>
            {post.title}
          </div>
          <div className="item-card-body" style={{ fontSize: 14 }}>{post.body}</div>
          <div style={{ marginTop: 12, fontSize: 12, color: '#94a3b8' }}>
            Fetched {fetchCount} time{fetchCount !== 1 ? 's' : ''} · last at{' '}
            {lastFetched?.toLocaleTimeString() ?? '—'}
          </div>
        </div>
      )}
    </div>
  )
}
