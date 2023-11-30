import mysql, { ResultSetHeader, RowDataPacket } from "mysql2";
import { dbConfig } from "./db-access.ts";
import { dbToSections, dbToShows, dbToVenues } from "./db-conv.ts";
import { Section, Show, User, Venue } from "./db-types.ts";

export function createPool() {
    return mysql.createPool({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.passwd,
        database: dbConfig.database,
    });
}

export async function getUser(email: string, passwd: string) {
    return new Promise<User>((resolve, reject) => {
        const pool = createPool();
        pool.execute("SELECT * FROM users WHERE email=? AND passwd=?", [email, passwd], (error, rows) => {
            // Close the connection, prevents issues with too many connections
            pool.end();
            if (error) {
                return reject("Database error getting user");
            }
            if (!rows) {
                return reject("User doesn't exist");
            }
            rows = rows as RowDataPacket[];
            if (rows.length != 1) {
                return reject("User doesn't exist");
            }

            // Return the user
            return resolve({
                id: rows[0].ID,
                email: rows[0].email,
                isAdmin: rows[0].isAdmin,
            });
        });
    });
}

export async function createUser(email: string, passwd: string, isAdmin: boolean) {
    return new Promise<User>((resolve, reject) => {
        const pool = createPool();
        // No need to check if the user already exists, the DB will throw an error if the user's email matches another entry
        pool.execute(
            "INSERT INTO users(email, passwd, isAdmin) VALUES(?,?,?)",
            [email, passwd, isAdmin],
            (error, result) => {
                // Close the connection, prevents issues with too many connections
                pool.end();
                if (error) {
                    if (error.code == "ER_DUP_ENTRY") {
                        return reject("The given user already exists, password is incorrect");
                    }
                    return reject("Database error creating user:" + error);
                }
                if (!result) {
                    return reject("No rows updated when creating user");
                }
                result = result as ResultSetHeader;
                if (result.affectedRows == 1) {
                    // Return the user
                    return resolve({
                        id: result.insertId,
                        email: email,
                        isAdmin: isAdmin,
                    });
                }
                return reject("No rows updated when creating user");
            }
        );
    });
}

export async function getSections(venueID: number) {
    return new Promise<Section[]>((resolve, reject) => {
        const pool = createPool();
        pool.execute("SELECT * FROM sections WHERE venueID=?", [venueID], (error, rows) => {
            // Close the connection, prevents issues with too many connections
            pool.end();
            if (error) {
                return reject("Database error getting sections for venue");
            }
            if (!rows) {
                return reject("No sections found for given venue");
            }
            rows = rows as RowDataPacket[];
            return resolve(dbToSections(rows));
        });
    });
}

export async function createSection(venue: Venue, name: string, rows: number, cols: number) {
    return new Promise<number>((resolve, reject) => {
        if (!venue.id) {
            return reject("No venue ID in venue");
        }
        const pool = createPool();
        // We need to use backticks around rows and cols because they are reserved words in MySQL
        pool.execute(
            "INSERT INTO sections(venueID, name, `rows`, cols) VALUES(?,?,?,?)",
            [venue.id, name, rows, cols],
            (error, result) => {
                // Close the connection, prevents issues with too many connections
                pool.end();
                if (error) {
                    return reject("Database error:" + error);
                }
                if (!result) {
                    return reject("No rows updated when creating section");
                }
                result = result as ResultSetHeader;
                if (result.affectedRows == 1) {
                    return resolve(result.insertId);
                }
                return reject("No rows updated when creating section");
            }
        );
    });
}

export async function deleteSections(venue: Venue) {
    return new Promise<RowDataPacket[]>((resolve, reject) => {
        const pool = createPool();
        let sectionsToDelete: RowDataPacket[];
        pool.execute("SELECT * FROM sections WHERE venueID=?", [venue.id], (error, rows) => {
            // Close the connection, prevents issues with too many connections
            if (error) {
                pool.end();
                return reject("Database error getting sections to delete: " + error);
            }
            if (!rows) {
                pool.end();
                return reject("No sections for that venue to delete");
            }
            sectionsToDelete = rows as RowDataPacket[];
        });
        pool.execute("DELETE FROM sections WHERE venueID=?", [venue.id], (error, result) => {
            // Close the connection, prevents issues with too many connections
            pool.end();
            if (error) {
                return reject("Database error deleting sections: " + error);
            }

            // Process the result
            result = result as ResultSetHeader;
            if (!result) {
                return reject("Unable to delete sections");
            }
            if (result.affectedRows > 0) {
                return resolve(sectionsToDelete);
            }
            return reject("Unable to delete sections");
        });
    });
}

export async function getVenues(user: User) {
    return new Promise<Venue[]>((resolve, reject) => {
        const pool = createPool();
        if (user.isAdmin) {
            // No need for userID checks, the user is an admin
            pool.execute("SELECT * FROM venues", (error, rows) => {
                // Close the connection, prevents issues with too many connections
                pool.end();
                if (error) {
                    return reject(error);
                }
                if (!rows) {
                    return reject("No venues found");
                }
                rows = rows as RowDataPacket[];
                return resolve(dbToVenues(rows));
            });
        } else {
            pool.execute("SELECT * FROM venues WHERE userID=?", [user.id], (error, rows) => {
                // Close the connection, prevents issues with too many connections
                pool.end();
                if (error) {
                    return reject(error);
                }
                if (!rows) {
                    return reject("No venues found");
                }
                rows = rows as RowDataPacket[];
                return resolve(dbToVenues(rows));
            });
        }
    });
}

export async function venueExists(venueName: string) {
    return new Promise<boolean>((resolve, reject) => {
        const pool = createPool();
        pool.execute("SELECT * FROM venues WHERE name=?", [venueName], (error, rows) => {
            // Close the connection, prevents issues with too many connections
            pool.end();
            if (error) {
                return reject(error);
            }
            if (!rows) {
                return reject("Venue doesn't exist");
            }
            rows = rows as RowDataPacket[];
            return resolve(true);
        });
    });
}

export async function createVenue(name: string, user: User) {
    return new Promise<Venue>(async (resolve, reject) => {
        const pool = createPool();
        // No need to check if the venue already exists, the DB will throw an error if the venue's name matches another entry
        // Create the venue in the database
        pool.execute("INSERT INTO venues(name, userID) VALUES(?,?)", [name, user.id], (error, result) => {
            pool.end();
            if (error) {
                if (error.code == "ER_DUP_ENTRY") {
                    return reject("The given venue already exists");
                }
                return reject("DB error: " + error);
            }
            if (!result) {
                return reject("No rows updated when creating venue");
            }
            result = result as mysql.ResultSetHeader;
            if (result.affectedRows == 1) {
                return resolve({
                    id: result.insertId,
                    name: name,
                    shows: [],
                });
            }
            return reject("No rows updated when creating venue");
        });
    });
}

export async function deleteVenue(venueName: string, user: User) {
    return new Promise<Venue[]>((resolve, reject) => {
        const pool = createPool();
        let venuesToDelete: Venue[];
        if (user.isAdmin) {
            // No need for userID checks, the user is an admin
            pool.execute("SELECT * FROM venues WHERE name=?", [venueName], (error, rows) => {
                // Close the connection, prevents issues with too many connections
                if (error) {
                    pool.end();
                    return reject("Database error deleting venue: " + error);
                }
                if (!rows) {
                    pool.end();
                    return reject("No venues found for given name");
                }
                venuesToDelete = dbToVenues(rows as RowDataPacket[]);
            });
            pool.execute("DELETE FROM venues WHERE name=?", [venueName], (error, result) => {
                // Close the connection, prevents issues with too many connections
                pool.end();
                if (error) {
                    return reject("Database error deleting venue: " + error);
                }

                // Process the result
                result = result as ResultSetHeader;
                if (!result) {
                    return reject("Unable to delete venue");
                }
                if (result.affectedRows > 0) {
                    return resolve(venuesToDelete);
                }
                return reject("Unable to delete venue");
            });
        } else {
            pool.execute("SELECT * FROM venues WHERE name=? AND userID=?", [venueName, user.id], (error, rows) => {
                // Close the connection, prevents issues with too many connections
                if (error) {
                    pool.end();
                    return reject("Database error deleting venue: " + error);
                }
                if (!rows) {
                    pool.end();
                    return reject("You're not authorized to make modifications to that venue");
                }
                venuesToDelete = dbToVenues(rows as RowDataPacket[]);
            });
            pool.execute("DELETE FROM venues WHERE name=? AND userID=?", [venueName, user.id], (error, result) => {
                // Close the connection, prevents issues with too many connections
                pool.end();
                if (error) {
                    return reject("Database error deleting venue: " + error);
                }

                // Process the result
                result = result as ResultSetHeader;
                if (!result) {
                    return reject("You're not authorized to make modifications to that venue");
                }
                if (result.affectedRows > 0) {
                    return resolve(venuesToDelete);
                }
                return reject("You're not authorized to make modifications to that venue");
            });
        }
    });
}

export async function getShows(venue: Venue) {
    return new Promise<Show[]>((resolve, reject) => {
        if (!venue.id) {
            return reject("No venue ID in venue");
        }
        const pool = createPool();
        pool.execute("SELECT * FROM shows WHERE venueID=?", [venue.id], (error, rows) => {
            // Close the connection, prevents issues with too many connections
            pool.end();
            if (error) {
                return reject(error);
            }
            if (!rows) {
                return reject("No shows found for given venue");
            }
            rows = rows as RowDataPacket[];
            return resolve(dbToShows(rows));
        });
    });
}

export async function createShow(venue: Venue, name: string, date: Date, defaultPrice: number) {
    return new Promise<Show>((resolve, reject) => {
        if (!venue.id) {
            return reject("No venue ID in venue");
        }
        const pool = createPool();
        pool.execute(
            "INSERT INTO shows(venueID, name, date, defaultPrice) VALUES(?,?,?,?)",
            [venue.id, name, date, defaultPrice],
            (error, result) => {
                // Close the connection, prevents issues with too many connections
                pool.end();
                if (error) {
                    return reject("Database error:" + error);
                }
                if (!result) {
                    return reject("No rows updated when creating show");
                }
                result = result as ResultSetHeader;
                if (result.affectedRows == 1) {
                    return resolve({
                        id: result.insertId,
                        name: name,
                        date: date,
                        active: true,
                    });
                }
                return reject("No rows updated when creating show");
            }
        );
    });
}

export async function deleteShows(venue: Venue) {
    return new Promise<Show[]>((resolve, reject) => {
        const pool = createPool();
        let showsToDelete: RowDataPacket[];
        pool.execute("SELECT * FROM shows WHERE venueID=?", [venue.id], (error, rows) => {
            // Close the connection, prevents issues with too many connections
            if (error) {
                pool.end();
                return reject("Database error getting shows to delete: " + error);
            }
            if (!rows) {
                pool.end();
                return reject("No shows for that venue to delete");
            }
            showsToDelete = rows as RowDataPacket[];
        });
        pool.execute("DELETE FROM shows WHERE venueID=?", [venue.id], (error, result) => {
            // Close the connection, prevents issues with too many connections
            pool.end();
            if (error) {
                return reject("Database error deleting shows: " + error);
            }

            // Process the result
            result = result as ResultSetHeader;
            if (!result) {
                return reject("Unable to delete shows");
            }
            if (result.affectedRows > 0) {
                return resolve(dbToShows(showsToDelete));
            }
            return reject("Unable to delete shows");
        });
    });
}
