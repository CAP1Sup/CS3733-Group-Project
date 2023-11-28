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
    return new Promise<string>((resolve, reject) => {
        const pool = createPool();
        pool.query("SELECT ID FROM users WHERE email=? AND passwd=?", [email, passwd], (error, rows) => {
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

export async function addUser(email: string, passwd: string) {
    return new Promise<string>((resolve, reject) => {
        const pool = createPool();
        pool.query("INSERT into users(email, passwd) VALUES(?,?)", [email, passwd], (error, rows) => {
            // Close the connection, prevents issues with too many connections
            pool.end();
            if (error) {
                if (error.code == "ER_DUP_ENTRY") {
                    return reject("The given user already exists, password is incorrect");
                }
                return reject("Database error:" + error);
            }
            if (!rows) {
                return reject("No rows updated when adding user");
            }
            rows = rows as ResultSetHeader;
            if (rows.affectedRows == 1) {
                return resolve("User added");
            }
            return reject("No rows updated when adding user");
        });
    });
}

export async function getVenues(userID: number) {
    return new Promise<RowDataPacket[]>((resolve, reject) => {
        const pool = createPool();
        pool.query("SELECT * FROM venues WHERE userID=?", [userID], (error, rows) => {
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
        pool.query("SELECT * FROM shows WHERE venueID=?", [venueID], (error, rows) => {
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
