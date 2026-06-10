import { useNavigate } from "react-router-dom";
import { useGetArticlesQuery } from "../api/articlesApi";

const categoryColors: Record<string, string> = {
  React: "#0891b2",
  Architecture: "#7c3aed",
  TypeScript: "#2563eb",
  Performance: "#059669",
  "State Management": "#d97706",
};

export default function Articles() {
  const { data: articles, loading, error } = useGetArticlesQuery(undefined, {
    fetchOnRender: true,
  });

  const navigate = useNavigate();

  return (
    <div>
      <h1 className="page-title">6. Articles — Cache Invalidation</h1>
      <p className="page-desc">
        Each article is loaded with <code>getArticle</code> providing{" "}
        <code>{"{ name: 'articles', id }"}</code> tags. Editing an article
        triggers <code>updateArticle</code>, which invalidates that exact tag —
        auto-refetching both the detail view and this list.
      </p>

      <div className="badges">
        <span className="badge">providesTags (fn)</span>
        <span className="badge">invalidatesTags (fn)</span>
        <span className="badge">per-item invalidation</span>
        <span className="badge">nested routes</span>
      </div>

      <div className="code-block">
        <span className="code-comment">// List provides per-item tags</span>
        {"\n"}
        {"getArticles: builder.query<void, Article[]>(() => ({ url: '/articles' }), {\n"}
        {"  providesTags: (res) => res?.map(a => ({ name: "}
        <span className="code-string">'articles'</span>
        {", id: a.id })) || ["}
        <span className="code-string">'articles'</span>
        {"]\n"}
        {"})\n\n"}
        <span className="code-comment">// Mutation invalidates only the changed item</span>
        {"\n"}
        {"updateArticle: builder.mutation<..., Article>(..., {\n"}
        {"  invalidatesTags: (res) => res ? [{ name: "}
        <span className="code-string">'articles'</span>
        {", id: res.id }] : ["}
        <span className="code-string">'articles'</span>
        {"]\n"}
        {"})"}
      </div>

      {loading && (
        <div className="state-loading">
          <span className="spinner" />
          Loading articles…
        </div>
      )}

      {error && (
        <div className="state-error">Failed to load articles. Is the server running?</div>
      )}

      {articles && (
        <div className="item-grid">
          {articles.map((article) => (
            <div
              key={article.id}
              className="item-card"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/articles/${article.id}`)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 20,
                    background: `${categoryColors[article.category] ?? "#64748b"}18`,
                    color: categoryColors[article.category] ?? "#64748b",
                  }}
                >
                  {article.category}
                </span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>#{article.id}</span>
              </div>

              <div className="item-card-title">{article.title}</div>

              <div className="item-card-body" style={{ marginBottom: 12 }}>
                {article.body.slice(0, 100)}…
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>{article.author}</span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>
                  {new Date(article.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
