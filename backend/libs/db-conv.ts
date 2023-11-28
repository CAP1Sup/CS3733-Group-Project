import { RowDataPacket } from "mysql2";
import { getShows, getUser, getVenues } from "./db-query";

export type Venue = {
    id?: number;
    name: string;
    shows: Show[];
};

export type Show = {
    id?: number;
    name: string;
    date: string;
    active: boolean;
};

export function dbToVenue(rows: RowDataPacket[]) {
    const venues: Venue[] = [];
    for (let i = 0; i < rows.length; i++) {
        const venue: Venue = {
            id: rows[i].ID,
            name: rows[i].name,
            shows: [],
        };
        venues.push(venue);
    }
    return venues;
}

export function dbToShow(rows: RowDataPacket[]) {
    const shows: Show[] = [];
    for (let i = 0; i < rows.length; i++) {
        const show: Show = {
            id: rows[i].ID,
            name: rows[i].name,
            date: rows[i].date,
            active: rows[i].active,
        };
        shows.push(show);
    }
    return shows;
}

// TODO: Test this function
export async function getUserVenueJSON(email: string, passwd: string) {
    // Pull all of the data from the DB
    const userID = await getUser(email, passwd);
    const venues = dbToVenue(await getVenues(parseInt(userID)));
    for (let i = 0; i < venues.length; i++) {
        if (venues[i].id != null) {
            venues[i].shows = dbToShow(await getShows(venues[i].id));
        }
    }

    // Remove the unneeded data from the JSON
    for (let i = 0; i < venues.length; i++) {
        delete venues[i].id;
        for (let j = 0; j < venues[i].shows.length; j++) {
            delete venues[i].shows[j].id;
        }
    }
    return JSON.stringify(venues);
}

/*
export function dbShowToJSON(rows: RowDataPacket[]) {
    // Remove the ID, venueID, and default price from the JSON
    for (let i = 0; i < rows.length; i++) {
        delete rows[i].ID;
        delete rows[i].venueID;
        delete rows[i].defaultPrice;
    }
    return JSON.stringify(rows);
}*/
