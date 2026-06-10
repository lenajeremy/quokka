import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetArticleQuery, useUpdateArticleMutation } from "../api/articlesApi";

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: article, loading } = useGetArticleQuery(Number(id), {
    fetchOnRender: true,
  });

  const { trigger: updateArticle, loading: saving, error: saveError } =
    useUpdateArticleMutation();

  const [editing, setEditing] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (article && !editing) {
      setTitle(article.title);
      setBody(article.body);
      setCategory(article.category);
    }
  }, [article]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await updateArticle({ id: Number(id), title, body, category });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading && !article) {
    return (
      <div className="state-loading">
        <span className="spinner" />
        Loading article…
      </div>
    );
  }

  if (!article) {
    return <div className="state-error">Article not found.</div>;
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <button
        className="btn btn-secondary"
        onClick={() => navigate("/articles")}
        style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}
      >
        ← Back to articles
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
            {article.author} · {new Date(article.publishedAt).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })}
          </p>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 20,
              background: "#0891b218",
              color: "#0891b2",
            }}
          >
            {article.category}
          </span>
        </div>

        {!editing && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              setTitle(article.title);
              setBody(article.body);
              setCategory(article.category);
              setEditing(true);
            }}
          >
            Edit
          </button>
        )}
      </div>

      {saved && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#16a34a",
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          Article saved. Cache invalidated — list and detail both refetched.
        </div>
      )}

      {!editing ? (
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", marginBottom: 20, lineHeight: 1.3 }}>
            {article.title}
          </h1>
          <div style={{ fontSize: 15, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-line" }}>
            {article.body}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div className="section">
            <div className="section-title">Edit article</div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                Title
              </label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                Category
              </label>
              <input
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                Body
              </label>
              <textarea
                className="input"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                style={{ resize: "vertical", fontFamily: "inherit", lineHeight: 1.7 }}
                required
              />
            </div>

            {saveError && (
              <div className="state-error" style={{ marginBottom: 14 }}>
                Failed to save. Try again.
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="code-block" style={{ marginTop: 40 }}>
        <span className="code-comment">// After save, invalidation fires:</span>
        {"\n"}
        {"invalidatesTags: (res) => [{ name: "}
        <span className="code-string">'articles'</span>
        {", id: res.id }]\n\n"}
        <span className="code-comment">// Matches this article's providesTags in getArticle:</span>
        {"\n"}
        {"providesTags: (res) => [{ name: "}
        <span className="code-string">'articles'</span>
        {", id: res.id }]\n\n"}
        <span className="code-comment">// AND the same tag in getArticles (this article's entry):</span>
        {"\n"}
        {"providesTags: (res) => res?.map(a => ({ name: "}
        <span className="code-string">'articles'</span>
        {", id: a.id }))"}
      </div>
    </div>
  );
}
