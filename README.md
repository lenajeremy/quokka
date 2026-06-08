# quokkajs

A lightweight, type-safe data-fetching library for React. Define your API once, get fully typed hooks back automatically — with built-in caching, tag-based cache invalidation, debouncing, polling, and more.

Inspired by [RTK Query](https://redux-toolkit.js.org/rtk-query/overview), but without the Redux dependency.

```bash
npm install quokkajs
# or
yarn add quokkajs
```

---

## Table of Contents

- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
  - [createApi](#createapi)
  - [QuokkaProvider](#quokkaprovider)
  - [Query hooks](#query-hooks)
  - [Mutation hooks](#mutation-hooks)
  - [useFetch](#usefetch)
- [Caching](#caching)
- [Tag-based Cache Invalidation](#tag-based-cache-invalidation)
- [TypeScript](#typescript)

---

## Quick Start

### 1. Wrap your app in `QuokkaProvider`

```tsx
// main.tsx
import { QuokkaProvider } from 'quokkajs';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QuokkaProvider getState={() => {}}>
    <App />
  </QuokkaProvider>
);
```

### 2. Define your API

```ts
// api/todoApi.ts
import { createApi } from 'quokkajs';

type Todo = {
  id: number;
  title: string;
  isDone: boolean;
};

const todoApi = createApi({
  apiName: 'todoApi',
  baseUrl: 'http://localhost:8080/todos',
  tags: ['todos'],
  endpoints: (builder) => ({
    getTodos: builder.query<string, Todo[]>((search) => ({
      url: '/list',
      params: { search },
    }), { providesTags: ['todos'] }),

    createTodo: builder.mutation<{ title: string }, Todo>((body) => ({
      url: '/create',
      method: 'POST',
      body,
    }), { invalidatesTags: ['todos'] }),
  }),
});

export const { useGetTodoQuery, useCreateTodoMutation } = todoApi.actions;
```

### 3. Use the hooks in your components

```tsx
// App.tsx
import { useGetTodosQuery, useCreateTodoMutation } from './api/todoApi';

function App() {
  const { data: todos, loading, error } = useGetTodosQuery('', {
    fetchOnRender: true,
  });

  const { trigger: createTodo } = useCreateTodoMutation();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching todos</p>;

  return (
    <div>
      {todos?.map((todo) => <p key={todo.id}>{todo.title}</p>)}
      <button onClick={() => createTodo({ title: 'New todo' })}>Add</button>
    </div>
  );
}
```

When `createTodo` succeeds, `useGetTodosQuery` automatically re-fetches because their tags overlap — no manual refetch needed.

---

## Core Concepts

### Queries vs. Mutations

- **Queries** are for reading data (`GET`). They support caching, debouncing, polling, and reactive re-fetching.
- **Mutations** are for writing data (`POST`, `PUT`, `PATCH`, `DELETE`). They can invalidate cached queries on success.

### Auto-generated hook names

quokkajs derives hook names from your endpoint keys at runtime:

| Endpoint key | Generated hook |
|---|---|
| `getTodos` | `useGetTodosQuery` |
| `createTodo` | `useCreateTodoMutation` |
| `searchImages` | `useSearchImagesQuery` |
| `updatePost` | `useUpdatePostMutation` |

The suffix (`Query` or `Mutation`) is determined by whether you used `builder.query` or `builder.mutation`.

### The cache

Every query response is cached using a SHA-256 hash of the request parameters as the key. Subsequent calls with identical parameters serve from cache instantly. Mutations invalidate cache entries by tag, triggering automatic background re-fetches of the affected queries.

---

## API Reference

### `createApi`

The entry point for defining an API slice.

```ts
const myApi = createApi({
  apiName: string;           // unique identifier for this API
  baseUrl: string;           // prepended to all endpoint URLs
  tags?: TagType<TagString>; // list of tags this API works with
  prepareHeaders?: (getState: () => RootState, headers: Headers) => Headers;
  endpoints: (builder) => ({ ... });
});
```

#### `prepareHeaders`

Use this to inject auth tokens or other headers that apply to every request in this API. It receives a `getState` function (sourced from `QuokkaProvider`) so you can read from a global store like Zustand or Redux.

```ts
const api = createApi({
  apiName: 'myApi',
  baseUrl: 'https://api.example.com',
  prepareHeaders: (getState, headers) => {
    const token = getState<RootState>().auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
  endpoints: (builder) => ({ ... }),
});
```

#### `builder.query<Takes, Returns>(paramsFn, options?)`

Defines a read endpoint. `paramsFn` receives the args passed to the hook and returns the request parameters.

```ts
endpoints: (builder) => ({
  getUser: builder.query<{ id: string }, User>((args) => ({
    url: `/users/${args.id}`,
    // method defaults to GET
  }), {
    providesTags: ['users'], // cache tag(s) this query provides
  }),
})
```

#### `builder.mutation<Takes, Returns>(paramsFn, options?)`

Defines a write endpoint. `method` is required.

```ts
endpoints: (builder) => ({
  deleteUser: builder.mutation<{ id: string }, void>((args) => ({
    url: `/users/${args.id}`,
    method: 'DELETE',
  }), {
    invalidatesTags: ['users'], // cache tag(s) to invalidate on success
  }),
})
```

---

### `QuokkaProvider`

Wraps your application and provides the shared cache and state accessor.

```tsx
<QuokkaProvider getState={getState}>
  {children}
</QuokkaProvider>
```

| Prop | Type | Description |
|---|---|---|
| `getState` | `() => RootState` | Function that returns your global state. Pass `useStore.getState` for Zustand or `store.getState` for Redux. If you don't use a global store, pass `() => {}`. |

---

### Query hooks

Every `builder.query` endpoint generates a `useXxxQuery` hook.

```ts
const { data, loading, initLoading, error, trigger } = useGetTodosQuery(args, options);
```

#### Arguments

| Argument | Type | Description |
|---|---|---|
| `args` | `Takes` | Passed to your `paramsFn` to build the request. Re-evaluated on every render. |
| `options` | `QueryHookOptions` | See below. |

#### Return value

| Field | Type | Description |
|---|---|---|
| `data` | `Returns \| undefined` | The response data. `undefined` until a successful fetch. |
| `loading` | `boolean` | `true` while a fetch is in flight. |
| `initLoading` | `boolean` | `true` only during the first automatic fetch (useful for skeleton states). |
| `error` | `Error \| undefined` | Set when the request fails or returns a non-2xx response. |
| `trigger` | `(args: Takes) => Promise<Returns \| undefined>` | Manually fire the request. |

#### `QueryHookOptions`

| Option | Type | Default | Description |
|---|---|---|---|
| `fetchOnRender` | `boolean` | `false` | Automatically fetch when the component first mounts. |
| `fetchOnArgsChange` | `boolean` | `false` | Re-fetch whenever `args` changes. |
| `refetchOnFocus` | `boolean` | `false` | Re-fetch when the browser window regains focus. |
| `pollingInterval` | `number` | — | Re-fetch on an interval (milliseconds). |
| `debouncedDuration` | `number` | `0` | Debounce automatic fetches by this many milliseconds. Useful for search-as-you-type. |

**Example — debounced search:**

```tsx
const { data: images, loading } = useSearchImagesQuery(
  { query, color },
  { fetchOnArgsChange: true, debouncedDuration: 500 }
);
```

**Example — polling with focus refetch:**

```tsx
const { data: todos } = useGetTodosQuery('', {
  fetchOnRender: true,
  refetchOnFocus: true,
  pollingInterval: 30000, // re-fetch every 30 seconds
});
```

---

### Mutation hooks

Every `builder.mutation` endpoint generates a `useXxxMutation` hook.

```ts
const { data, loading, error, trigger } = useCreateTodoMutation(options?);
```

#### Return value

| Field | Type | Description |
|---|---|---|
| `data` | `Returns \| undefined` | The response data from the last successful call. |
| `loading` | `boolean` | `true` while the mutation is in flight. |
| `error` | `Error \| undefined` | Set when the request fails or returns a non-2xx response. |
| `trigger` | `(args: Takes) => Promise<Returns \| undefined>` | Fire the mutation. |

#### Handling errors

`trigger` throws on failure, so use `try/catch` if you need to handle errors imperatively:

```tsx
const { trigger } = useCreateTodoMutation();

async function handleSubmit() {
  try {
    const result = await trigger({ title: 'Buy milk' });
    console.log('Created:', result);
  } catch (err) {
    console.error('Failed:', err);
  }
}
```

**Example — form submission:**

```tsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const { trigger, loading, error } = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await trigger({ email });
    } catch (err) {
      // error state is also set automatically
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Log in'}
      </button>
      {error && <p>{error.message}</p>}
    </form>
  );
}
```

---

### `useFetch`

A lower-level hook for one-off requests that don't belong to a `createApi` slice. Accepts a `RequestInfo` and `RequestInit` directly.

```ts
const { data, loading, error, trigger } = useFetch<TArgs, TReturns, TError>(
  input,
  init?,
  options?
);
```

| Option | Type | Description |
|---|---|---|
| `fetchOnRender` | `boolean` | Fetch automatically on first render. |
| `fetchOnArgsChange` | `boolean` | Re-fetch when `input` or `init` changes. |
| `debouncedDuration` | `number` | Debounce automatic fetches. |

**Example:**

```tsx
const { data, loading, trigger } = useFetch<{ name: string }, User>(
  'https://api.example.com/me',
  { method: 'GET', headers: { Authorization: 'Bearer token' } },
  { fetchOnRender: true }
);
```

`useFetch` does not use the cache or `QuokkaProvider` — it is a standalone hook.

---

## Caching

quokkajs maintains an in-memory cache scoped to the `QuokkaProvider` instance. Each cache entry is keyed by a SHA-256 hash of the fully-resolved request parameters (URL, method, headers, body, query params) with keys recursively sorted to ensure parameter-order independence.

**Cache hit behaviour:** When a query is triggered and a valid cache entry exists for those parameters, the cached value is returned immediately without a network request.

**Cache invalidation:** Cache entries are invalidated by tag when a mutation with a matching `invalidatesTags` succeeds. After invalidation, any query that `providesTags` a matching tag is automatically re-triggered with its last-used arguments.

---

## Tag-based Cache Invalidation

Tags connect mutations to the queries they should invalidate. A mutation that succeeds will refetch every currently-mounted query whose `providesTags` overlaps with its `invalidatesTags`.

```ts
const api = createApi({
  apiName: 'postsApi',
  baseUrl: 'https://api.example.com',
  tags: ['posts'],
  endpoints: (builder) => ({
    // This query "owns" the 'posts' cache
    getPosts: builder.query<void, Post[]>(() => ({
      url: '/posts',
    }), { providesTags: ['posts'] }),

    // This mutation invalidates it on success
    deletePost: builder.mutation<{ id: number }, void>((args) => ({
      url: `/posts/${args.id}`,
      method: 'DELETE',
    }), { invalidatesTags: ['posts'] }),
  }),
});
```

After `deletePost` succeeds, `useGetPostsQuery` automatically re-fetches in the background. No manual `refetch()` calls or state updates needed.

Tags can also be objects with a `key` and `id` for fine-grained per-item invalidation:

```ts
providesTags: [{ key: 'posts', id: 42 }]
invalidatesTags: [{ key: 'posts', id: 42 }]
```

---

## TypeScript

quokkajs is written in TypeScript and provides full inference with no manual annotation needed on the consumer side.

The `MakeHook<T, Tags>` mapped type derives the hook name and full signature (argument types, return types) from your endpoint definitions. This means:

- Passing wrong args to a hook is a compile-time error
- `data` is typed as `Returns | undefined`
- `trigger` is typed as `(args: Takes) => Promise<Returns | undefined>`

**Full typed example:**

```ts
type SearchParams = { query: string; page?: number };
type SearchResponse = { photos: Image[]; total_results: number };

const pexelsApi = createApi({
  apiName: 'pexelsApi',
  baseUrl: 'https://api.pexels.com/v1',
  prepareHeaders: (_, headers) => {
    headers.set('Authorization', process.env.PEXELS_API_KEY!);
    return headers;
  },
  endpoints: (builder) => ({
    searchImages: builder.query<SearchParams, SearchResponse>((args) => ({
      url: '/search',
      params: args,
    })),
  }),
});

export const { useSearchImagesQuery } = pexelsApi.actions;

// In a component:
const { data } = useSearchImagesQuery({ query: 'mountains' }, { fetchOnRender: true });
// data is typed as SearchResponse | undefined ✓
```

---

## License

MIT © [Jeremiah Lena](https://github.com/lenajeremy)
