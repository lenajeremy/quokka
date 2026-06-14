import React from 'react'
import { useGetPostQuery } from '../api/postsApi'

const SHORT_TTL = 10_000 // 10 seconds
const NEVER_TTL = -1     // never expires

export default function CacheTTL() {
  const [fetchCountShort, setFetchCountShort] = React.useState(0)
  const [fetchCountNever, setFetchCountNever] = React.useState(0)
  const [lastFetchedShort, setLastFetchedShort] = React.useState<Date | null>(null)
  const [lastFetchedNever, setLastFetchedNever] = React.useState<Date | null>(null)
  const [elapsed, setElapsed] = React.useState(0)

  // Short TTL — cache entry expires after 10s
  const { data: shortPost, loading: shortLoading, trigger: triggerShort } = useGetPostQuery(1, {
    fetchOnRender: true,
    refetchOnFocus: true,
    ttl: SHORT_TTL,
  })

  // Never-expiring — stays cached until a mutation invalidates it
  const { data: neverPost, loading: neverLoading, trigger: triggerNever } = useGetPostQuery(2, {
    fetchOnRender: true,
    refetchOnFocus: true,
    ttl: NEVER_TTL,
  })

  React.useEffect(() => {
    if (!shortLoading && shortPost) {
      setFetchCountShort((c) => c + 1)
      setLastFetchedShort(new Date())
      setElapsed(0)
    }
  }, [shortPost, shortLoading])

  React.useEffect(() => {
    if (!neverLoading && neverPost) {
      setFetchCountNever((c) => c + 1)
      setLastFetchedNever(new Date())
    }
  }, [neverPost, neverLoading])

  React.useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const ttlRemaining = Math.max(0, Math.round((SHORT_TTL / 1000) - elapsed))
  const isExpired = elapsed >= SHORT_TTL / 1000

  return (
    <div>
      <h1 className="page-title">7. Cache TTL</h1>
      <p className="page-desc">
        Cache entries expire automatically based on a <code>ttl</code> (time-to-live) in milliseconds.
        After expiry, the next automatic refetch goes to the network instead of serving from cache.
        Pass <code>ttl: -1</code> to keep an entry valid indefinitely.
      </p>

      <div className="badges">
        <span className="badge">ttl</span>
        <span className="badge">ttl: -1</span>
        <span className="badge">refetchOnFocus</span>
        <span className="badge">cache expiry</span>
      </div>

      <div className="code-block">
        <span className="code-comment">// Expires after 10 seconds — next auto-fetch goes to network</span>{'\n'}
        {'useGetPostQuery(1, { fetchOnRender: '}
        <span className="code-keyword">true</span>
        {', refetchOnFocus: '}
        <span className="code-keyword">true</span>
        {', ttl: '}
        <span className="code-number">10_000</span>
        {' })\n\n'}
        <span className="code-comment">// Never expires — stays cached until a mutation invalidates it</span>{'\n'}
        {'useGetPostQuery(2, { fetchOnRender: '}
        <span className="code-keyword">true</span>
        {', refetchOnFocus: '}
        <span className="code-keyword">true</span>
        {', ttl: '}
        <span className="code-number">-1</span>
        {' })'}
      </div>

      <div className="card" style={{ background: '#fffbeb', borderColor: '#fde68a', marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: '#92400e' }}>
          💡 <strong>Try it:</strong> Switch to another tab and come back repeatedly.
          The 10s query re-fetches after its TTL expires — the <code>ttl: -1</code> query never re-fetches on its own.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Short TTL */}
        <div className="card" style={{ borderColor: isExpired ? '#fca5a5' : '#86efac' }}>
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Post #1 — ttl: 10s</span>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
              background: isExpired ? '#fee2e2' : '#dcfce7',
              color: isExpired ? '#dc2626' : '#16a34a',
            }}>
              {isExpired ? '⚠ expired' : `✓ valid for ${ttlRemaining}s`}
            </span>
          </div>

          <div className="stats" style={{ marginBottom: 12 }}>
            <div className="stat">
              <div className="stat-label">Fetches</div>
              <div className="stat-value cyan">{fetchCountShort}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Last fetch</div>
              <div className="stat-value" style={{ fontSize: 12, paddingTop: 6 }}>
                {lastFetchedShort ? lastFetchedShort.toLocaleTimeString() : '—'}
              </div>
            </div>
          </div>

          <button
            className="btn btn-secondary"
            style={{ width: '100%', marginBottom: 10 }}
            onClick={() => triggerShort(1)}
            disabled={shortLoading}
          >
            {shortLoading ? 'Fetching…' : 'Manual trigger (always network)'}
          </button>

          {shortPost && (
            <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
              <strong>{shortPost.title}</strong>
            </div>
          )}
        </div>

        {/* Never-expiring TTL */}
        <div className="card" style={{ borderColor: '#a5b4fc' }}>
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Post #2 — ttl: -1</span>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
              background: '#ede9fe', color: '#7c3aed',
            }}>
              ∞ never expires
            </span>
          </div>

          <div className="stats" style={{ marginBottom: 12 }}>
            <div className="stat">
              <div className="stat-label">Fetches</div>
              <div className="stat-value cyan">{fetchCountNever}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Last fetch</div>
              <div className="stat-value" style={{ fontSize: 12, paddingTop: 6 }}>
                {lastFetchedNever ? lastFetchedNever.toLocaleTimeString() : '—'}
              </div>
            </div>
          </div>

          <button
            className="btn btn-secondary"
            style={{ width: '100%', marginBottom: 10 }}
            onClick={() => triggerNever(2)}
            disabled={neverLoading}
          >
            {neverLoading ? 'Fetching…' : 'Manual trigger (always network)'}
          </button>

          {neverPost && (
            <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
              <strong>{neverPost.title}</strong>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ background: '#0f172a', border: 'none' }}>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10, fontFamily: 'monospace' }}>
          How cache expiry works:
        </div>
        {[
          ['isValid', 'Date.now() - timeAdded < ttl'],
          ['ttl: 10_000', 'valid for 10 seconds after last fetch'],
          ['ttl: -1', 'always valid — only a mutation can invalidate it'],
          ['manual trigger', 'always bypasses cache (fetchFromCache = false)'],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', gap: 12, fontSize: 12, paddingBottom: 6 }}>
            <span style={{ fontFamily: 'monospace', color: '#7dd3fc', minWidth: 140 }}>{label}</span>
            <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
