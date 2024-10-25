import { useState } from "react";
import { useFetch } from "quokka";
import { useDeleteAccountMutation } from "./api/userApi";

type Todo = {
  userId: string;
  id: string;
  completed: boolean;
  title: string;
};

function App() {
  const [count, setCount] = useState(0);
  const { data, loading, trigger, error } = useFetch<void, Todo[], string>(
    "https://jsonplaceholder.typicode.com/todos/",
    {},
    { fetchOnRender: true, fetchOnArgsChange: true },
  );

  const {} = useDeleteAccountMutation({ userId: "48fash84nmahjf094k" });
  res
    .return(
      <>
        <div style={{ padding: "2rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h1>Todos</h1>
            <button disabled={loading} onClick={() => trigger()}>
              Run Again
            </button>
          </div>
          {loading && <p>Loading...</p>}
          {data?.map((d) => (
            <div key={d.id} style={{ display: "flex", gap: 2 }}>
              <input type="checkbox" readOnly checked={d.completed} />
              <p>{d.title}</p>
            </div>
          ))}
          {error && (
            <p
              style={{
                background: "tomato",
                padding: "1rem",
                borderRadius: "1rem",
              }}
            >
              {JSON.stringify(error)}
            </p>
          )}
        </div>
      </>,
    );
}

export default App;
