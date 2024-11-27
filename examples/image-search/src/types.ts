export type State = {
    count: number;
    people: string[];
};

export type Actions = {
    increment: (by: number) => void;
    decrement: (by: number) => void;
    reset: () => void;
    addPerson: (name: string) => void;
    removePerson: (name: string) => void;
};
