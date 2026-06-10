import React from 'react'
import { useLoginMutation, useGetMeQuery, useLogoutMutation } from '../api/authApi'
import { useAuthStore } from '../store'

const DEMO_ACCOUNTS = [
  { email: 'alice@example.com', password: 'password123', role: 'admin' },
  { email: 'bob@example.com', password: 'securepass', role: 'user' },
  { email: 'carol@example.com', password: 'carol2024', role: 'user' },
]

export default function Auth() {
  const { token, setToken } = useAuthStore()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const { trigger: login, loading: loggingIn, error: loginError } = useLoginMutation()
  const { data: me, loading: loadingMe, trigger: fetchMe } = useGetMeQuery(undefined, {})
  const { trigger: logout } = useLogoutMutation()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await login({ email, password })
      if (res?.token) setToken(res.token)
    } catch {
      // loginError is set automatically
    }
  }

  async function handleLogout() {
    try {
      await logout(undefined)
    } finally {
      setToken('')
    }
  }

  return (
    <div>
      <h1 className="page-title">5. Auth with prepareHeaders</h1>
      <p className="page-desc">
        Login stores a token in Zustand. <code>prepareHeaders</code> reads it via <code>getState</code>
        and injects it into every request made by <code>authApi</code> — no manual header management needed.
      </p>

      <div className="badges">
        <span className="badge">prepareHeaders</span>
        <span className="badge">getState</span>
        <span className="badge">mutations</span>
        <span className="badge">zustand</span>
      </div>

      <div className="code-block">
        <span className="code-comment">// authApi injects the token on every request</span>{'\n'}
        {'const authApi = createApi({\n'}
        {'  prepareHeaders: (getState, headers) => {\n'}
        {'    const { token } = getState<AuthStore>()\n'}
        {'    if (token) headers.set('}
        <span className="code-string">'Authorization'</span>
        {', `Bearer ${token}`)\n'}
        {'    return headers\n'}
        {'  },\n'}
        {'  ...\n'}
        {'})\n'}
        <span className="code-comment">// Wire up the store in the provider</span>{'\n'}
        {'<QuokkaProvider getState={useAuthStore.getState}>'}
      </div>

      {!token ? (
        <div className="section">
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">Demo accounts — click to fill</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  className="btn btn-secondary"
                  onClick={() => { setEmail(acc.email); setPassword(acc.password) }}
                  style={{ fontSize: 12 }}
                >
                  {acc.email}
                  <span style={{ marginLeft: 6, color: '#94a3b8', fontWeight: 400 }}>
                    ({acc.role})
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 340 }}>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <button type="submit" className="btn btn-primary" disabled={loggingIn}>
                {loggingIn ? 'Logging in…' : 'Log in'}
              </button>
            </div>
            {loginError && (
              <div className="state-error" style={{ marginTop: 12 }}>
                {(loginError as Error).message || 'Invalid credentials'}
              </div>
            )}
          </form>
        </div>
      ) : (
        <div className="section">
          <div className="card" style={{ marginBottom: 16, borderColor: '#bbf7d0', background: '#f0fdf4' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginBottom: 6 }}>
                  ✓ Logged in — token stored in Zustand
                </div>
                <div className="token-display" style={{ fontSize: 11 }}>
                  Authorization: Bearer {token.substring(0, 24)}…
                </div>
              </div>
              <button className="btn btn-secondary" onClick={handleLogout} style={{ fontSize: 12 }}>
                Log out
              </button>
            </div>
          </div>

          <p style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>
            Click below to call <code>GET /auth/me</code> — the token is injected automatically
            by <code>prepareHeaders</code> reading from the Zustand store.
          </p>

          <div className="input-row">
            <button
              className="btn btn-primary"
              onClick={() => fetchMe(undefined)}
              disabled={loadingMe}
            >
              {loadingMe ? 'Fetching…' : 'Fetch my profile (GET /auth/me)'}
            </button>
          </div>

          {me && (
            <div className="card">
              <div className="card-title">Authenticated response</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: '#0891b2', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 16, flexShrink: 0,
                }}>
                  {me.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{me.name}</div>
                  <div style={{ color: '#64748b', fontSize: 13 }}>{me.email}</div>
                  <span style={{
                    display: 'inline-block', marginTop: 4,
                    background: me.role === 'admin' ? '#fef3c7' : '#f0f9ff',
                    color: me.role === 'admin' ? '#92400e' : '#0369a1',
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                  }}>
                    {me.role}
                  </span>
                </div>
              </div>

              <div style={{ background: '#0f172a', borderRadius: 6, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, color: '#475569', marginBottom: 8, fontFamily: 'monospace' }}>
                  Headers sent by prepareHeaders:
                </div>
                {[
                  ['content-type', 'application/json'],
                  ['Authorization', `Bearer ${token.substring(0, 24)}…`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 12, fontSize: 12, paddingBottom: 6 }}>
                    <span style={{ fontFamily: 'monospace', color: '#7dd3fc', minWidth: 160 }}>{k}</span>
                    <span style={{ fontFamily: 'monospace', color: '#86efac' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
