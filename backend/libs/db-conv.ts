import { RowDataPacket } from "mysql2";
import { getShows, getUser, getVenues } from "./db-query";
import { Section, Show, User, Venue } from "./db-types";

export function dbToVenues(venueRows: RowDataPacket[]) {
    const venues: Venue[] = [];
    for (let i = 0; i < venueRows.length; i++) {
        const venue: Venue = {
            id: venueRows[i].ID,
            name: venueRows[i].name,
            shows: [],
        };
        venues.push(venue);
    }
    return venues;
}

export function dbToSections(sectionRows: RowDataPacket[]) {
    const sections: Section[] = [];
    for (let i = 0; i < sectionRows.length; i++) {
        const section: Section = {
            id: sectionRows[i].ID,
            name: sectionRows[i].name,
            rows: sectionRows[i].rows,
            columns: sectionRows[i].columns,
        };
        sections.push(section);
    }
    return sections;
}

export function dbToShows(showRows: RowDataPacket[]) {
    const shows: Show[] = [];
    for (let i = 0; i < showRows.length; i++) {
        const show: Show = {
            id: showRows[i].ID,
            name: showRows[i].name,
            date: showRows[i].date,
            active: showRows[i].active,
        };
        shows.push(show);
    }
    return shows;
}

export async function getUserVenueJSON(user: User) {
    // Pull all of the data from the DB
    try {
        const venues = await getVenues(user);
        for (let i = 0; i < venues.length; i++) {
            if (venues[i].id) {
                venues[i].shows = await getShows(venues[i]);
            } else {
                throw "No venue ID in venue";
            }
        }

        // Remove the unneeded data from the JSON
        for (let i = 0; i < venues.length; i++) {
            delete venues[i].id;
            delete venues[i].sections;
            if (venues[i].shows) {
                for (let j = 0; j < venues[i].shows.length; j++) {
                    delete venues[i].shows[j].id;
                }
            } else {
                throw "No shows in venue";
            }
        }
        return JSON.stringify(venues);
    } catch (error) {
        return error;
    }
}
