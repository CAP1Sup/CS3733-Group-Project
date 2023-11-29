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

export async function getVenuesJSON(user: User) {
    // Pull all of the data from the DB
    return new Promise<string>(async (resolve, reject) => {
        try {
            const venues = await getVenues(user);
            for (let i = 0; i < venues.length; i++) {
                if (venues[i].id) {
                    venues[i].shows = await getShows(venues[i]);
                } else {
                    reject("No venue ID in venue");
                }
            }

            // Remove the unneeded data from the JSON
            for (let i = 0; i < venues.length; i++) {
                delete venues[i].id;
                delete venues[i].sections;
                if (venues[i].shows) {
                    for (let j = 0; j < venues[i].shows.length; j++) {
                        delete venues[i].shows[j].id;
                        delete venues[i].shows[j].defaultPrice;
                    }
                } else {
                    reject("No shows in venue");
                }
            }
            return resolve(JSON.stringify(venues));
        } catch (error) {
            return reject(error);
        }
    });
}

export async function getShowJSON(show: Show) {
    // Pull all of the data from the DB
    return new Promise<string>(async (resolve, reject) => {
        try {
            // TODO: Finish writing
            /*
            const sections = await getSections(show);
            for (let i = 0; i < sections.length; i++) {
                if (sections[i].id) {
                    sections[i].seats = await getSeats(sections[i]);
                } else {
                    throw "No section ID in section";
                }
            }

            // Remove the unneeded data from the JSON
            for (let i = 0; i < sections.length; i++) {
                delete sections[i].id;
                delete sections[i].venue;
                if (sections[i].seats) {
                    for (let j = 0; j < sections[i].seats.length; j++) {
                        delete sections[i].seats[j].id;
                        delete sections[i].seats[j].section;
                        delete sections[i].seats[j].block;
                        delete sections[i].seats[j].show;
                    }
                } else {
                    throw "No seats in section";
                }
            }
            return JSON.stringify(sections);*/
            return resolve("");
        } catch (error) {
            return reject(error);
        }
    });
}
