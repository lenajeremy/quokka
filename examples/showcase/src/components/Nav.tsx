import { NavLink } from 'react-router-dom'

const pages = [
  { path: '/basic-query', label: '1. Basic Query', desc: 'fetchOnRender · trigger · loading · error' },
  { path: '/debounced-search', label: '2. Debounced Search', desc: 'fetchOnArgsChange · debouncedDuration' },
  { path: '/crud-invalidation', label: '3. CRUD + Invalidation', desc: 'providesTags · invalidatesTags' },
  { path: '/polling', label: '4. Polling', desc: 'pollingInterval · refetchOnFocus' },
  { path: '/auth-use-fetch', label: '5. Auth', desc: 'prepareHeaders · getState · login flow' },
]

export default function Nav() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="logo">quokkajs</span>
        <span className="logo-sub">showcase</span>
      </div>
      <nav>
        {pages.map((p) => (
          <NavLink key={p.path} to={p.path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-label">{p.label}</span>
            <span className="nav-desc">{p.desc}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <a href="https://npmjs.com/package/quokkajs" target="_blank" rel="noreferrer">npm</a>
        <a href="https://github.com/lenajeremy/quokka" target="_blank" rel="noreferrer">github</a>
      </div>
    </aside>
  )
}
