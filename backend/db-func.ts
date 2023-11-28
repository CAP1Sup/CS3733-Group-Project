import mysql, { QueryError, RowDataPacket } from "mysql2";
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
            rows = rows as mysql.RowDataPacket[];
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
                return reject("Database error:" + error);
            }
            if (!rows) {
                return reject("No rows updated when adding user");
            }
            rows = rows as mysql.ResultSetHeader;
            if (rows.affectedRows == 1) {
                return resolve("User added");
            }
            return reject("No rows updated when adding user");
        });
    });
}

export async function getVenues(userID: string) {
    return new Promise<mysql.RowDataPacket[]>((resolve, reject) => {
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
            return resolve(rows as mysql.RowDataPacket[]);
        });
    });
}
