import mysql, { ResultSetHeader, RowDataPacket } from "mysql2";
import { dbConfig } from "./db-access.ts";

export function createPool() {
    return mysql.createPool({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.passwd,
        database: dbConfig.database,
    });
}

export async function getUser(email: string, passwd: string) {
    return new Promise<number>((resolve, reject) => {
        const pool = createPool();
        pool.execute("SELECT ID FROM users WHERE email=? AND passwd=?", [email, passwd], (error, rows) => {
            // Close the connection, prevents issues with too many connections
            pool.end();
            if (error) {
                return reject("Database error getting user");
            }
            if (!rows) {
                return reject("No users found");
            }
            rows = rows as RowDataPacket[];
            return resolve(rows[0].ID);
        });
    });
}

export async function createUser(email: string, passwd: string) {
    return new Promise<number>((resolve, reject) => {
        const pool = createPool();
        pool.execute("INSERT INTO users(email, passwd) VALUES(?,?)", [email, passwd], (error, result) => {
            // Close the connection, prevents issues with too many connections
            pool.end();
            if (error) {
                if (error.code == "ER_DUP_ENTRY") {
                    return reject("The given user already exists, password is incorrect");
                }
                return reject("Database error:" + error);
            }
            if (!result) {
                return reject("No rows updated when adding user");
            }
            result = result as ResultSetHeader;
            if (result.affectedRows == 1) {
                return resolve(result.insertId);
            }
            return reject("No rows updated when adding user");
        });
    });
}

export async function getSections(venueID: number) {
    return new Promise<RowDataPacket[]>((resolve, reject) => {
        const pool = createPool();
        pool.execute("SELECT * FROM sections WHERE venueID=?", [venueID], (error, rows) => {
            // Close the connection, prevents issues with too many connections
            pool.end();
            if (error) {
                return reject("Database error getting sections for venue");
            }
            if (!rows) {
                return reject("No section found for venue");
            }
            return resolve(rows as RowDataPacket[]);
        });
    });
}

export async function createSection(venueID: number, name: string, rows: number, cols: number) {
    return new Promise<number>((resolve, reject) => {
        const pool = createPool();
        // We need to use backticks around rows and cols because they are reserved words in MySQL
        pool.execute(
            "INSERT INTO sections(venueID, name, `rows`, cols) VALUES(?,?,?,?)",
            [venueID, name, rows, cols],
            (error, result) => {
                // Close the connection, prevents issues with too many connections
                pool.end();
                if (error) {
                    return reject("Database error:" + error);
                }
                if (!result) {
                    return reject("No rows updated when adding section");
                }
                result = result as ResultSetHeader;
                if (result.affectedRows == 1) {
                    return resolve(result.insertId);
                }
                return reject("No rows updated when adding section");
            }
        );
    });
}

export async function deleteSections(venueID: number) {
    return new Promise<RowDataPacket[]>((resolve, reject) => {
        const pool = createPool();
        let sectionsToDelete: RowDataPacket[];
        pool.execute("SELECT * FROM sections WHERE venueID=?", [venueID], (error, rows) => {
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
        pool.execute("DELETE FROM sections WHERE venueID=?", [venueID], (error, result) => {
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

export async function getVenues(userID: number) {
    return new Promise<RowDataPacket[]>((resolve, reject) => {
        const pool = createPool();
        pool.execute("SELECT * FROM venues WHERE userID=?", [userID], (error, rows) => {
            // Close the connection, prevents issues with too many connections
            pool.end();
            if (error) {
                return reject(error);
            }
            if (!rows) {
                return reject("No venues found");
            }
            return resolve(rows as RowDataPacket[]);
        });
    });
}

export async function getShows(venueID: number) {
    return new Promise<RowDataPacket[]>((resolve, reject) => {
        const pool = createPool();
        pool.execute("SELECT * FROM shows WHERE venueID=?", [venueID], (error, rows) => {
            // Close the connection, prevents issues with too many connections
            pool.end();
            if (error) {
                return reject(error);
            }
            if (!rows) {
                return reject("No shows found for given venue");
            }
            return resolve(rows as RowDataPacket[]);
        });
    });
}
