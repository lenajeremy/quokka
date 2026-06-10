import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Nav from './components/Nav'
import BasicQuery from './pages/BasicQuery'
import DebouncedSearch from './pages/DebouncedSearch'
import CrudInvalidation from './pages/CrudInvalidation'
import Polling from './pages/Polling'
import AuthAndUseFetch from './pages/AuthAndUseFetch'
import Articles from './pages/Articles'
import ArticleDetail from './pages/ArticleDetail'

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Nav />
        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/basic-query" replace />} />
            <Route path="/basic-query" element={<BasicQuery />} />
            <Route path="/debounced-search" element={<DebouncedSearch />} />
            <Route path="/crud-invalidation" element={<CrudInvalidation />} />
            <Route path="/polling" element={<Polling />} />
            <Route path="/auth-use-fetch" element={<AuthAndUseFetch />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
