import { useGetPostsQuery } from '../api/postsApi'

export default function BasicQuery() {
  const { data: posts, loading, error, trigger } = useGetPostsQuery(void 0, {
    fetchOnRender: true,
  })

  return (
    <div>
      <h1 className="page-title">1. Basic Query</h1>
      <p className="page-desc">
        Fetch data on mount and manually refetch on demand. Demonstrates loading states, error handling, and the <code>trigger</code> function.
      </p>

      <div className="badges">
        <span className="badge">fetchOnRender</span>
        <span className="badge">loading</span>
        <span className="badge">error</span>
        <span className="badge">trigger</span>
      </div>

      <div className="code-block">
        <span className="code-comment">// Define the API</span>{'\n'}
        {'const postsApi = createApi({\n'}
        {'  apiName: \'postsApi\',\n'}
        {'  baseUrl: \'https://jsonplaceholder.typicode.com\',\n'}
        {'  endpoints: (builder) => ({\n'}
        {'    getPosts: builder.query<void, Post[]>(() => ({ url: \'/posts\' })),\n'}
        {'  }),\n'}
        {'})\n\n'}
        <span className="code-comment">// Use the generated hook</span>{'\n'}
        {'const { data, loading, error, trigger } = useGetPostsQuery(undefined, {\n'}
        {'  fetchOnRender: '}
        <span className="code-keyword">true</span>
        {',\n'}
        {'})'}
      </div>

      <div className="section">
        <div className="input-row">
          <button
            className="btn btn-primary"
            onClick={() => trigger(undefined)}
            disabled={loading}
          >
            {loading ? 'Fetching…' : 'Refetch'}
          </button>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            {posts ? `${posts.length} posts loaded` : '—'}
          </span>
        </div>

        {error && (
          <div className="state-error">
            Error: {(error as Error).message || JSON.stringify(error)}
          </div>
        )}

        {loading && (
          <div className="state-loading">
            <span className="spinner" />
            Fetching posts…
          </div>
        )}

        {!loading && posts && (
          <div className="item-grid">
            {posts.map((post) => (
              <div key={post.id} className="item-card">
                <div className="item-card-title">#{post.id} — {post.title}</div>
                <div className="item-card-body">{post.body}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
