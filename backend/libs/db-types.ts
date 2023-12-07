export type User = {
    id: number;
    email: string;
    passwd: string;
    isAdmin: boolean;
};

export type Venue = {
    id?: number;
    name: string;
    sections?: Section[];
    shows: Show[];
};

export type Section = {
    id?: number;
    name: string;
    rows: number;
    columns: number;
    seats?: Seat[];
};

export type Show = {
    id?: number;
    name: string;
    time: Date;
    defaultPrice?: number;
    active?: boolean;
    seats?: Section[];
};

export type Seat = {
    id?: number;
    blockId?: number;
    block?: Block;
    row: number;
    column: number;
    purchased: boolean;
};

export type Block = {
    id?: number;
    showID?: number;
    name: string;
    price: number;
};
