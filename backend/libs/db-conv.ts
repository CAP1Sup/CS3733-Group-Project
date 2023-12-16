import { RowDataPacket } from "mysql2";
import { getActiveShows, getBlocks, getSeats, getShows, getVenues } from "./db-query";
import { Block, Seat, Section, Show, User, Venue } from "./db-types";
import { Connection } from "mysql2/promise";

export function dbToUser(userRows: RowDataPacket[]): User {
    return {
        id: userRows[0].ID,
        email: userRows[0].email,
        passwd: userRows[0].passwd,
        isAdmin: userRows[0].isAdmin,
    };
}

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
            columns: sectionRows[i].cols,
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
            time: new Date(showRows[i].date),
            active: showRows[i].active,
        };
        shows.push(show);
    }
    return shows;
}

export function dbToSeats(seatRows: RowDataPacket[]) {
    const seats: Seat[] = [];
    for (let i = 0; i < seatRows.length; i++) {
        const seat: Seat = {
            id: seatRows[i].ID,
            blockId: seatRows[i].blockID,
            row: seatRows[i].row,
            column: seatRows[i].col,
            purchased: seatRows[i].purchased,
        };
        seats.push(seat);
    }
    return seats;
}

export function dbToBlock(blockRows: RowDataPacket[]) {
    const blocks: Block[] = [];
    for (let i = 0; i < blockRows.length; i++) {
        const block: Block = {
            id: blockRows[i].ID,
            showID: blockRows[i].showID,
            name: blockRows[i].name,
            price: blockRows[i].price,
        };
        blocks.push(block);
    }
    return blocks;
}

export async function getVenuesJSON(user: User, db: Connection) {
    // Pull all of the data from the DB
    return new Promise<string>(async (resolve, reject) => {
        try {
            let venues: Venue[];

            // Get the venues that match the user's info
            venues = await getVenues(user, db);

            // Get the shows for each venue
            for (let i = 0; i < venues.length; i++) {
                if (venues[i].id) {
                    venues[i].shows = await getShows(venues[i], db);
                } else {
                    reject("No venue ID in venue");
                }
            }

            // Remove the unneeded data
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

export async function getVenueShowsJSON(venue: Venue, db: Connection) {
    // Pull all of the data from the DB
    return new Promise<string>(async (resolve, reject) => {
        try {
            let shows: Show[];

            // Get the shows for the venue
            shows = await getShows(venue, db);

            // Error if there are no shows
            if (shows.length === 0) {
                reject("No shows for venue");
            }

            // Remove the unneeded data
            for (let i = 0; i < shows.length; i++) {
                delete shows[i].id;
                delete shows[i].defaultPrice;
                delete shows[i].seats;
            }

            return resolve(JSON.stringify({ shows: shows }));
        } catch (error) {
            return reject(error);
        }
    });
}

export async function getActiveShowsJSON(db: Connection) {
    // Pull all of the data from the DB
    return new Promise<string>(async (resolve, reject) => {
        try {
            let venues: Venue[];

            // Create an admin user to get all of the venues
            // Quick hack to get all of the venues
            const user = { id: 0, email: "", passwd: "", isAdmin: true };
            venues = await getVenues(user, db);

            // Get the active shows for each venue
            for (let i = 0; i < venues.length; i++) {
                if (venues[i].id) {
                    venues[i].shows = await getActiveShows(venues[i], db);
                } else {
                    reject("No venue ID in venue");
                }
            }

            // Remove venues that don't have any active shows
            for (let i = 0; i < venues.length; i++) {
                if (venues[i].shows.length === 0) {
                    venues.splice(i, 1);
                    i--;
                }
            }

            // Remove the unneeded data
            for (let i = 0; i < venues.length; i++) {
                delete venues[i].id;
                delete venues[i].sections;
                if (venues[i].shows) {
                    for (let j = 0; j < venues[i].shows.length; j++) {
                        delete venues[i].shows[j].id;
                        delete venues[i].shows[j].defaultPrice;
                        delete venues[i].shows[j].active;
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

export async function getMatchingNamesJSON(query: string, db: Connection) {
    // Pull all of the data from the DB
    return new Promise<string>(async (resolve, reject) => {
        try {
            let venues: Venue[];

            // Create an admin user to get all of the venues
            // Quick hack to get all of the venues
            const user = { id: 0, email: "", passwd: "", isAdmin: true };
            venues = await getVenues(user, db);

            // Get all of the shows for each venue
            for (let i = 0; i < venues.length; i++) {
                if (venues[i].id) {
                    venues[i].shows = await getActiveShows(venues[i], db);
                } else {
                    reject("No venue ID in venue");
                }
            }

            // Remove any venues or shows that don't match the query
            // All shows are kept if the venue matches the query
            for (let i = 0; i < venues.length; i++) {
                if (!venues[i].name.toLowerCase().includes(query.toLowerCase())) {
                    for (let j = 0; j < venues[i].shows.length; j++) {
                        if (!venues[i].shows[j].name.toLowerCase().includes(query.toLowerCase())) {
                            venues[i].shows.splice(j, 1);
                            j--;
                        }
                    }
                }
            }

            // Remove venues that don't have any shows
            for (let i = 0; i < venues.length; i++) {
                if (venues[i].shows.length === 0) {
                    venues.splice(i, 1);
                    i--;
                }
            }

            // Remove the unneeded data
            for (let i = 0; i < venues.length; i++) {
                delete venues[i].id;
                delete venues[i].sections;
                if (venues[i].shows) {
                    for (let j = 0; j < venues[i].shows.length; j++) {
                        delete venues[i].shows[j].id;
                        delete venues[i].shows[j].defaultPrice;
                        delete venues[i].shows[j].active;
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

export async function getSeatJSON(venue: Venue, show: Show, db: Connection) {
    // Pull all of the data from the DB
    return new Promise<string>(async (resolve, reject) => {
        try {
            // Get the seats for the show
            let sections = await getSeats(venue, show, db);

            // Loop through the sections and remove the unneeded data
            for (let i = 0; i < sections.length; i++) {
                delete sections[i].id;

                // Remove the unneeded data
                // TODO: Add proper check to prevent undefined errors
                for (let j = 0; j < sections[i].seats.length; j++) {
                    delete sections[i].seats[j].id;
                    delete sections[i].seats[j].block?.id;
                    delete sections[i].seats[j].block?.showID;
                }
            }

            // Return the simplified data
            return resolve(JSON.stringify(sections));
        } catch (error) {
            return reject(error);
        }
    });
}
