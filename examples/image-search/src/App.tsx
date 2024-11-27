import React from "react";
import {Color, useSearchImagesQuery} from "./api/pexelsApi";
import {useUpdatePostMutation} from "./api/typicodeApi";
import {QuokkaProvider} from "quokka";
import {createStore} from "zustand";
import {Actions, State} from "./types.ts";

const useStore = createStore<State & Actions>((set) => ({
    count: 0,
    people: [],
    increment: (by = 10) => set((state) => ({count: state.count + by})),
    decrement: (by = 10) => set((state) => ({count: state.count - by})),
    reset: () => set(() => ({count: 0, people: []})),
    addPerson: (name) => set((state) => ({people: [...state.people, name]})),
    removePerson: (name) =>
        set((state) => ({people: state.people.filter((p) => p !== name)})),
}));

function App() {
    const [query, setQuery] = React.useState("");
    const [color, setColor] = React.useState<Color | undefined>("#111111");

    const {
        loading: isLoadingImages,
        data: images,
        error,
    } = useSearchImagesQuery(
        {query, color},
        {debouncedDuration: 500, fetchOnArgsChange: true}
    );

    const {trigger, data, error: updateMutationError} = useUpdatePostMutation();
    const [text, setText] = React.useState("")
    const {people, addPerson, removePerson} = useStore.getState()

    return (
        <div style={{padding: "2rem"}}>
            <form onSubmit={e => {
                e.preventDefault()
                if (text.length > 5) {
                    addPerson(text)
                    setText("")
                }
            }}>
                <input onChange={e => setText(e.currentTarget.value)} value={text}/>
            </form>
            <div>
                {people.map(p => (
                    <div id = {p}>{p} <button onClick={() => removePerson(p)}>x</button></div>
                ))}
            </div>
            <pre>{updateMutationError?.stack}</pre>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <h1>Images</h1>
                <button
                    disabled={isLoadingImages}
                    onClick={() =>
                        trigger({
                            id: "1",
                            postDetails: {
                                id: 1,
                                userId: 40,
                                title: "something interesting",
                                body: "what do you think?",
                            },
                        })
                    }
                >
                    Run Again
                </button>
            </div>

            <pre>{JSON.stringify(data, null, 3)}</pre>

            <div style={{display: "flex", gap: 20, alignItems: "center"}}>
                <input
                    value={query}
                    onChange={(e) => setQuery(e.currentTarget.value)}
                />

                <input
                    value={color}
                    type="color"
                    style={{height: "100%"}}
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
                        style={{display: "flex", flexDirection: "column", gap: 2}}
                    >
                        <img
                            src={image.src.large}
                            alt={image.photographer}
                            style={{width: "100%", height: "100%", objectFit: "cover"}}
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
                    {JSON.stringify(error, null, 3)}
                </p>
            )}
        </div>
    );
}

export default function Main() {
    return (
        <QuokkaProvider getState={useStore.getState}>
            <App/>
        </QuokkaProvider>
    );
}
