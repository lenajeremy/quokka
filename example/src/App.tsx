import React from "react";
import { Color, useSearchImagesQuery } from "./api/pexelsApi";

function App() {
  const [query, setQuery] = React.useState("");
  const [color, setColor] = React.useState<Color | undefined>();

  const {
    loading: isLoadingImages,
    data: images,
    trigger,
    error,
  } = useSearchImagesQuery(
    { query, color },
    { debouncedDuration: 500, fetchOnArgsChange: true }
  );

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1>Images</h1>
        <button disabled={isLoadingImages} onClick={() => trigger({ query })}>
          Run Again
        </button>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />

        <input
          value={color}
          type="color"
          style={{ height: "100%" }}
          onChange={(e) => setColor(e.currentTarget.value as Color)}
        />
        <div
          style={{
            height: 28,
            borderRadius: 14,
            marginRight: 10,
            width: 28,
            background: color,
          }}
        />
        {color}
        <p onClick={() => setColor(undefined)}>clear color</p>
      </div>

      {isLoadingImages && <p>Loading...</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "1.5rem",
        }}
      >
        {images?.photos?.map((image) => (
          <div
            key={image.id}
            style={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <img
              src={image.src.large}
              alt={image.photographer}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3>{image.photographer}</h3>
              <button>Download</button>
            </div>
          </div>
        ))}
      </div>

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
  );
}

export default App;
