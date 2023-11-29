export type User = {
    id: number;
    email: string;
    isAdmin: boolean;
};

export type Venue = {
    id?: number;
    name: string;
    sections?: Section[];
    shows?: Show[];
};

export type Section = {
    id?: number;
    name: string;
    rows: number;
    columns: number;
};

export type Show = {
    id?: number;
    name: string;
    date: string;
    active: boolean;
};
