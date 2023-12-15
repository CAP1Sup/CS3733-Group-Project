import mysql, { Connection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { dbConfig } from "./db-access.ts";
import { dbToBlock as dbToBlocks, dbToSeats, dbToSections, dbToShows, dbToUser, dbToVenues } from "./db-conv.ts";
import { Block, Seat, Section, Show, User, Venue } from "./db-types.ts";

const defaultBlockName = "Default";

export function beginTransaction() {
    return new Promise<Connection>(async (resolve, reject) => {
        try {
            const connection = await mysql.createConnection({
                host: dbConfig.host,
                user: dbConfig.user,
                password: dbConfig.passwd,
                database: dbConfig.database,
            });
            connection.beginTransaction();
            return resolve(connection);
        } catch (error) {
            return reject(error);
        }
    });
}

export async function getUser(email: string, passwd: string, db: Connection) {
    return new Promise<User>(async (resolve, reject) => {
        try {
            // Get the user from the DB
            let [rows] = await db.execute("SELECT * FROM users WHERE email=? AND passwd=?", [email, passwd]);

            // Check if the user exists
            rows = rows as RowDataPacket[];
            if (rows.length < 1) {
                throw "User doesn't exist";
            } else if (rows.length > 1) {
                throw "Multiple users with the same email and password";
            }

            // Return the user
            return resolve(dbToUser(rows));
        } catch (error) {
            return reject("Database error getting user: " + error);
        }
    });
}

export async function createUser(email: string, passwd: string, isAdmin: boolean, db: Connection) {
    return new Promise<User>(async (resolve, reject) => {
        // No need to check if the user already exists, the DB will throw an error if the user's email matches another entry
        try {
            // Try to insert the user into the DB
            let [result] = await db.execute("INSERT INTO users(email, passwd, isAdmin) VALUES(?,?,?)", [
                email,
                passwd,
                isAdmin,
            ]);

            // Check that the user was created
            result = result as ResultSetHeader;
            if (result.affectedRows == 1) {
                // Return the user
                return resolve({
                    id: result.insertId,
                    email: email,
                    passwd: passwd,
                    isAdmin: isAdmin,
                });
            }

            // No rows were updated, error
            throw "No rows updated when creating user";
        } catch (error: any) {
            if (error.hasOwnProperty("code")) {
                if (error.code == "ER_DUP_ENTRY") {
                    return reject("The given user already exists");
                }
            }
            return reject("Database error creating user:" + error);
        }
    });
}

export async function getSections(venueID: number, db: Connection) {
    return new Promise<Section[]>(async (resolve, reject) => {
        try {
            let [rows] = await db.execute("SELECT * FROM sections WHERE venueID=?", [venueID]);
            rows = rows as RowDataPacket[];
            if (rows.length == 0) {
                throw "No sections for that venue";
            }
            return resolve(dbToSections(rows));
        } catch (error) {
            return reject("Database error getting sections: " + error);
        }
    });
}

export async function createSection(venue: Venue, name: string, rows: number, cols: number, db: Connection) {
    return new Promise<number>(async (resolve, reject) => {
        if (!venue.id) {
            return reject("No venue ID in venue");
        }
        try {
            // We need to use backticks around rows and cols because they are reserved words in MySQL
            let [result] = await db.execute("INSERT INTO sections(venueID, name, `rows`, cols) VALUES(?,?,?,?)", [
                venue.id,
                name,
                rows,
                cols,
            ]);

            result = result as ResultSetHeader;
            if (result.affectedRows == 1) {
                return resolve(result.insertId);
            }
            throw "No rows updated when creating section";
        } catch (error) {
            return reject("Database error creating section: " + error);
        }
    });
}

export async function deleteSections(venue: Venue, db: Connection) {
    return new Promise<Section[]>(async (resolve, reject) => {
        try {
            // Get the sections to delete
            let sectionsToDelete: Section[];
            let [rows] = await db.execute("SELECT * FROM sections WHERE venueID=?", [venue.id]);
            sectionsToDelete = dbToSections(rows as RowDataPacket[]);

            // Delete the sections
            let [result] = await db.execute("DELETE FROM sections WHERE venueID=?", [venue.id]);
            result = result as ResultSetHeader;
            if (result.affectedRows > 0) {
                return resolve(sectionsToDelete);
            }
            throw "Unable to delete sections";
        } catch (error) {
            return reject("Database error deleting sections: " + error);
        }
    });
}

export async function getVenues(user: User, db: Connection) {
    return new Promise<Venue[]>(async (resolve, reject) => {
        try {
            if (user.isAdmin) {
                // No need for userID checks, the user is an admin
                let [rows] = await db.execute("SELECT * FROM venues");
                rows = rows as RowDataPacket[];
                return resolve(dbToVenues(rows));
            } else {
                let [rows] = await db.execute("SELECT * FROM venues WHERE userID=?", [user.id]);
                rows = rows as RowDataPacket[];
                return resolve(dbToVenues(rows));
            }
        } catch (error) {
            return reject("Database error getting venues: " + error);
        }
    });
}

export async function venueExists(venueName: string, db: Connection) {
    return new Promise<boolean>(async (resolve, reject) => {
        try {
            let [rows] = await db.execute("SELECT * FROM venues WHERE name=?", [venueName]);
            rows = rows as RowDataPacket[];
            if (rows.length == 0) {
                throw "Venue doesn't exist";
            }
            return resolve(true);
        } catch (error) {
            return reject("Database error checking if venue exists: " + error);
        }
    });
}

export async function createVenue(name: string, user: User, db: Connection) {
    return new Promise<Venue>(async (resolve, reject) => {
        // No need to check if the venue already exists, the DB will throw an error if the venue's name matches another entry
        try {
            let [result] = await db.execute("INSERT INTO venues(name, userID) VALUES(?,?)", [name, user.id]);
            result = result as mysql.ResultSetHeader;
            if (result.affectedRows == 1) {
                return resolve({
                    id: result.insertId,
                    name: name,
                    shows: [],
                });
            }
            throw "No rows updated when creating venue";
        } catch (error: any) {
            if (error.hasOwnProperty("code")) {
                if (error.code == "ER_DUP_ENTRY") {
                    return reject("The given venue already exists");
                }
            }
            return reject("Database error creating venue: " + error);
        }
    });
}

export async function deleteVenue(venueName: string, user: User, db: Connection) {
    return new Promise<Venue[]>(async (resolve, reject) => {
        try {
            let venuesToDelete: Venue[];
            if (user.isAdmin) {
                // No need for userID checks, the user is an admin
                let [rows] = await db.execute("SELECT * FROM venues WHERE name=?", [venueName]);
                venuesToDelete = dbToVenues(rows as RowDataPacket[]);

                // Delete the venue
                let [result] = await db.execute("DELETE FROM venues WHERE name=?", [venueName]);
                result = result as ResultSetHeader;
                if (result.affectedRows > 0) {
                    return resolve(venuesToDelete);
                }
                throw "Unable to delete venue";
            } else {
                // Check if the user is authorized for the given venue
                let [rows] = await db.execute("SELECT * FROM venues WHERE name=? AND userID=?", [venueName, user.id]);
                rows = rows as RowDataPacket[];
                if (rows.length == 0) {
                    throw "You're not authorized to make modifications to that venue";
                }
                venuesToDelete = dbToVenues(rows);

                // Delete the venue
                let [result] = await db.execute("DELETE FROM venues WHERE name=? AND userID=?", [venueName, user.id]);
                result = result as ResultSetHeader;
                if (result.affectedRows > 0) {
                    return resolve(venuesToDelete);
                }
                throw "Unable to delete venue";
            }
        } catch (error) {
            return reject("Database error deleting venue: " + error);
        }
    });
}

export async function getShows(venue: Venue, db: Connection) {
    return new Promise<Show[]>(async (resolve, reject) => {
        if (!venue.id) {
            return reject("No venue ID in venue");
        }
        try {
            let [rows] = await db.execute("SELECT * FROM shows WHERE venueID=?", [venue.id]);
            rows = rows as RowDataPacket[];
            return resolve(dbToShows(rows));
        } catch (error) {
            return reject("Database error getting shows: " + error);
        }
    });
}

export async function getActiveShows(venue: Venue, db: Connection) {
    return new Promise<Show[]>(async (resolve, reject) => {
        if (!venue.id) {
            return reject("No venue ID in venue");
        }
        try {
            let [rows] = await db.execute("SELECT * FROM shows WHERE venueID=? AND active=1", [venue.id]);
            rows = rows as RowDataPacket[];
            return resolve(dbToShows(rows));
        } catch (error) {
            return reject("Database error getting shows: " + error);
        }
    });
}

export async function createShow(venue: Venue, name: string, date: Date, defaultPrice: number, db: Connection) {
    return new Promise<Show>(async (resolve, reject) => {
        if (!venue.id) {
            return reject("No venue ID in venue");
        }

        try {
            // Check if the show already exists
            let [rows] = await db.execute("SELECT * FROM shows WHERE venueID=? AND name=? AND date=?", [
                venue.id,
                name,
                date.toISOString(),
            ]);
            rows = rows as RowDataPacket[];
            if (rows.length > 0) {
                throw "Show already exists";
            }

            // Create the show
            let show: Show = {
                name: name,
                time: date,
                active: false,
                defaultPrice: defaultPrice,
            };

            // Create the show in the database
            let [result] = await db.execute("INSERT INTO shows(venueID, name, date, defaultPrice) VALUES(?,?,?,?)", [
                venue.id,
                name,
                date.toISOString(),
                defaultPrice,
            ]);
            result = result as ResultSetHeader;
            if (result.affectedRows == 0) {
                throw "No rows updated when creating show";
            }
            if (!result.insertId) {
                throw "No ID returned when creating show";
            }
            show.id = result.insertId;

            // Try to create the seats
            show.seats = await createSeats(venue, show, db);

            return resolve(show);
        } catch (error) {
            return reject("Database error creating show: " + error);
        }
    });
}

export async function activateShow(venue: Venue, show: Show, db: Connection) {
    return new Promise<Show>(async (resolve, reject) => {
        try {
            // Check if the show exists
            let [rows] = await db.execute("SELECT * FROM shows WHERE ID=? AND venueID=?", [show.id, venue.id]);
            rows = rows as RowDataPacket[];
            if (rows.length == 0) {
                throw "Show doesn't exist";
            }

            // Activate the show
            let [result] = await db.execute("UPDATE shows SET active=1 WHERE ID=? AND venueID=?", [show.id, venue.id]);
            result = result as ResultSetHeader;
            if (result.affectedRows == 0) {
                throw "Unable to activate show";
            }

            // Return the updated show
            show.active = true;
            return resolve(show);
        } catch (error) {
            return reject("Database error activating show: " + error);
        }
    });
}

export async function deleteShow(user: User, venue: Venue, show: Show, db: Connection) {
    return new Promise<Show>(async (resolve, reject) => {
        try {
            let showToDelete: Show;

            // Check if the show exists
            let [rows] = await db.execute("SELECT * FROM shows WHERE ID=? AND venueID=?", [show.id, venue.id]);
            rows = rows as RowDataPacket[];
            if (rows.length == 0) {
                throw "Show doesn't exist";
            }
            showToDelete = dbToShows(rows)[0];

            // Check if the show is active
            if (!user.isAdmin) {
                if (showToDelete.active) {
                    throw "Only administrators can delete an active show";
                }
            }

            // Delete the show
            let [result] = await db.execute("DELETE FROM shows WHERE ID=? AND venueID=?", [show.id, venue.id]);

            // Process the result
            result = result as ResultSetHeader;
            if (result.affectedRows == 0) {
                throw "Unable to delete show";
            }

            // Delete the show's seats
            await deleteSeats(show, db);

            // Delete the show's blocks
            await deleteBlocks(show, db);

            // Return the deleted show
            if (!showToDelete) {
                throw "Show to delete is undefined";
            }
            return resolve(showToDelete);
        } catch (error) {
            return reject("Database error deleting show: " + error);
        }
    });
}

export async function getSeats(venue: Venue, show: Show, db: Connection) {
    return new Promise<Section[]>(async (resolve, reject) => {
        if (!venue.id) {
            return reject("No venue ID in venue");
        }
        if (!show.id) {
            return reject("No show ID in show");
        }
        try {
            const sections = await getSections(venue.id, db);
            for (let i = 0; i < sections.length; i++) {
                if (!sections[i].id) {
                    throw "No section ID in section";
                }

                // Get the seats for the section
                let [rows] = await db.execute("SELECT * FROM seats WHERE showID=? AND sectionID=?", [
                    show.id,
                    sections[i].id,
                ]);
                rows = rows as RowDataPacket[];
                sections[i].seats = dbToSeats(rows);

                // Get the blocks for the seats
                sections[i].seats = await getBlocks(sections[i].seats as Seat[], db);
            }

            return resolve(sections);
        } catch (error) {
            return reject("Database error getting seats: " + error);
        }
    });
}

export async function createSeats(venue: Venue, show: Show, db: Connection) {
    return new Promise<Section[]>(async (resolve, reject) => {
        // Validate the parameters
        if (!venue.id) {
            return reject("No venue ID in venue");
        }
        if (!show.id) {
            return reject("No show ID in show");
        }
        if (!show.defaultPrice) {
            return reject("No default price in show");
        }

        try {
            // Add the sections to the venue if they don't exist
            if (!venue.sections) {
                venue.sections = await getSections(venue.id, db);
            }

            // Create the default block
            const defaultBlock = await createBlock(show, defaultBlockName, show.defaultPrice, db);

            // Create the seats
            for (let i = 0; i < venue.sections.length; i++) {
                if (!venue.sections[i].id) {
                    throw "No section ID in section";
                }

                // Check to make sure that the seats don't already exist
                let [rows] = await db.execute("SELECT * FROM seats WHERE showID=? AND sectionID=?", [
                    show.id,
                    venue.sections[i].id,
                ]);
                rows = rows as RowDataPacket[];
                if (rows.length > 0) {
                    throw "Seats already exist";
                }

                // Create the seats in the database
                venue.sections[i].seats = [];
                for (let r = 0; r < venue.sections[i].rows; r++) {
                    for (let c = 0; c < venue.sections[i].columns; c++) {
                        let [result] = await db.execute(
                            "INSERT INTO seats(showID, blockID, sectionID, `row`, col) VALUES(?,?,?,?,?)",
                            [show.id, defaultBlock.id, venue.sections[i].id, r, c]
                        );
                        result = result as ResultSetHeader;
                        if (result.affectedRows == 0) {
                            throw "Unable to create seats in database";
                        }

                        // TODO: Fix this properly
                        venue.sections[i].seats.push({
                            id: result.insertId,
                            block: defaultBlock,
                            row: r,
                            column: c,
                            purchased: false,
                        });
                    }
                }
            }

            // Return the updated venue
            return resolve(venue.sections);
        } catch (error) {
            return reject("Database error creating seats: " + error);
        }
    });
}

export async function purchaseSeat(show: Show, section: Section, row: number, column: number, db: Connection) {
    return new Promise<Seat>(async (resolve, reject) => {
        // Make sure that the show and section have IDs
        if (!show.id) {
            return reject("No show ID in show");
        }

        if (!section.id) {
            return reject("No section ID in section");
        }

        try {
            // Query the database to see if the seat exists
            let [rows] = await db.execute("SELECT * FROM seats WHERE showID=? AND sectionID=? AND `row`=? AND col=?", [
                show.id,
                section.id,
                row,
                column,
            ]);

            // Process the result
            rows = rows as RowDataPacket[];
            if (rows.length == 0) {
                throw "Seat in " + section.name + ", row " + row + ", column " + column + " doesn't exist";
            } else if (rows.length > 1) {
                throw "Multiple seats found for the same section, row, and column";
            }

            // Convert the rows to a seat
            let seat = dbToSeats(rows)[0];

            // Make sure that the seat isn't already purchased
            if (seat.purchased) {
                throw "Seat in " + section.name + ", row " + row + ", column " + column + " is already purchased";
            }

            // Mark the seat as purchased
            let [result] = await db.execute(
                "UPDATE seats SET purchased=1 WHERE showID=? AND sectionID=? AND `row`=? AND col=?",
                [show.id, section.id, row, column]
            );
            result = result as ResultSetHeader;
            if (result.affectedRows == 0) {
                throw "Unable to set seat in" + section.name + ", row " + row + ", column " + column + " as purchased";
            }

            // Return the updated show
            seat.purchased = true;
            return resolve(seat);
        } catch (error) {
            return reject("Database error purchasing seat: " + error);
        }
    });
}

export async function setSeatBlock(
    show: Show,
    section: Section,
    row: number,
    column: number,
    block: Block,
    db: Connection
) {
    return new Promise<Seat>(async (resolve, reject) => {
        // Make sure that the show, section, and block have IDs
        if (!show.id) {
            return reject("No show ID in show");
        }

        if (!section.id) {
            return reject("No section ID in section");
        }

        if (!block.id) {
            return reject("No block ID in block");
        }

        try {
            // Query the database to see if the seat exists
            let [rows] = await db.execute("SELECT * FROM seats WHERE showID=? AND sectionID=? AND `row`=? AND col=?", [
                show.id,
                section.id,
                row,
                column,
            ]);

            // Process the result
            rows = rows as RowDataPacket[];
            if (rows.length == 0) {
                throw "Seat in " + section.name + ", row " + row + ", column " + column + " doesn't exist";
            } else if (rows.length > 1) {
                throw "Multiple seats found for the same section, row, and column";
            }

            // Convert the rows to a seat
            let seat = dbToSeats(rows)[0];

            // Set the block for the seat
            let [result] = await db.execute(
                "UPDATE seats SET blockID=? WHERE showID=? AND sectionID=? AND `row`=? AND col=?",
                [block.id, show.id, section.id, row, column]
            );
            result = result as ResultSetHeader;
            if (result.affectedRows == 0) {
                throw "Unable to set block of seat in" + section.name + ", row " + row + ", column " + column;
            }

            // Return the updated show
            seat.blockId = block.id;
            return resolve(seat);
        } catch (error) {
            return reject("Database error purchasing seat: " + error);
        }
    });
}

export async function setSeatBlockToDefault(show: Show, blockName: string, db: Connection) {
    return new Promise<number>(async (resolve, reject) => {
        // Make sure that the show has an ID
        if (!show.id) {
            return reject("No show ID in show");
        }

        try {
            // Get the default block ID
            const defaultBlock = await getBlockByName(show, defaultBlockName, db);

            // Make sure that the default block exists
            if (!defaultBlock.id) {
                throw "Default block doesn't exist";
            }

            // Get the block ID for the given block to delete
            const blockToDelete = await getBlockByName(show, blockName, db);

            // Make sure that the block to delete's id exists
            if (!blockToDelete.id) {
                throw "Block to delete doesn't exist";
            }

            // Update the seats that use the block to delete to use the default block
            let [updateResult] = await db.execute("UPDATE seats SET blockID=? WHERE blockID=?", [
                defaultBlock.id,
                blockToDelete.id,
            ]);
            updateResult = updateResult as ResultSetHeader;
            if (updateResult.affectedRows == 0) {
                throw "Unable to set seats to default block";
            }

            // Delete the block
            let [deleteResult] = await db.execute("DELETE FROM blocks WHERE ID=?", [blockToDelete.id]);
            deleteResult = deleteResult as ResultSetHeader;
            if (deleteResult.affectedRows == 0) {
                throw "Unable to delete old block";
            }

            // Return the number of affected rows
            return resolve(updateResult.affectedRows);
        } catch (error) {
            return reject("Database error purchasing seat: " + error);
        }
    });
}

export async function deleteSeats(show: Show, db: Connection) {
    return new Promise<Seat[]>(async (resolve, reject) => {
        try {
            // Get the seats to delete
            let seatsToDelete: Seat[];
            const [rows] = await db.execute("SELECT * FROM seats WHERE showID=?", [show.id]);
            seatsToDelete = dbToSeats(rows as RowDataPacket[]);

            // Delete the seats
            let [result] = await db.execute("DELETE FROM seats WHERE showID=?", [show.id]);

            // Process the result of the deletion
            result = result as ResultSetHeader;
            if (result.affectedRows > 0) {
                return resolve(seatsToDelete);
            }
            throw "Unable to delete seats";
        } catch (error) {
            return reject("Database error deleting seats: " + error);
        }
    });
}

export async function createBlock(show: Show, name: string, price: number, db: Connection) {
    return new Promise<Block>(async (resolve, reject) => {
        // Validate the parameters
        if (!show.id) {
            return reject("No ID in show");
        }

        try {
            // Check to make sure that the block doesn't already exist
            let [rows] = await db.execute("SELECT * FROM blocks WHERE showID=? AND name=?", [show.id, name]);
            rows = rows as RowDataPacket[];
            if (rows.length > 0) {
                throw "Block already exists";
            }

            // Create the block in the database
            let [result] = await db.execute("INSERT INTO blocks(showID, name, price) VALUES(?,?,?)", [
                show.id,
                name,
                price,
            ]);
            result = result as ResultSetHeader;
            if (result.affectedRows == 1) {
                return resolve({
                    id: result.insertId,
                    showID: show.id,
                    name: name,
                    price: price,
                });
            }
            throw "No rows updated when creating block";
        } catch (error) {
            return reject("Database error creating a block: " + error);
        }
    });
}

export async function getBlocks(seats: Seat[], db: Connection) {
    return new Promise<Seat[]>(async (resolve, reject) => {
        // Make sure that all seats have a block ID
        if (seats.some((seat) => !seat.blockId)) {
            return reject("No block ID in seats");
        }

        // Get a list of the unique block IDs
        const blockIds = new Set(seats.map((seat) => seat.blockId));

        try {
            // Get the blocks from the DB
            let blockRows: RowDataPacket[] = [];
            for (let blockId of blockIds) {
                let [rows] = await db.execute("SELECT * FROM blocks WHERE ID=?", [blockId]);
                rows = rows as RowDataPacket[];
                if (rows.length == 0) {
                    throw "Block doesn't exist";
                }
                blockRows.push(rows[0]);
            }

            // Convert the DB rows to block objects
            let blocks = dbToBlocks(blockRows);

            // Add the blocks to the seats
            for (let i = 0; i < seats.length; i++) {
                const block = blocks.find((block) => block.id === seats[i].blockId);
                if (!block) {
                    throw "No block found for seat: " + JSON.stringify(seats[i]);
                }
                seats[i].block = block;
                delete seats[i].blockId;
            }
            return resolve(seats);
        } catch (error) {
            return reject("Database error getting blocks: " + error);
        }
    });
}

export async function getBlockByName(show: Show, name: string, db: Connection) {
    return new Promise<Block>(async (resolve, reject) => {
        // Make sure that the show has an ID
        if (!show.id) {
            return reject("No ID in show");
        }

        try {
            // Check for the block in the DB
            let [rows] = await db.execute("SELECT * FROM blocks WHERE showID=? AND name=?", [show.id, name]);
            rows = rows as RowDataPacket[];
            if (rows.length == 0) {
                throw "Block doesn't exist";
            } else if (rows.length > 1) {
                throw "Multiple blocks with the given name found";
            }

            // Convert the DB rows to block objects
            return resolve(dbToBlocks(rows)[0]);
        } catch (error) {
            return reject("Database error getting block by name: " + error);
        }
    });
}

export async function deleteBlocks(show: Show, db: Connection) {
    return new Promise<Block[]>(async (resolve, reject) => {
        try {
            // Get the blocks to delete
            let blocksToDelete: Block[];
            const [rows] = await db.execute("SELECT * FROM blocks WHERE showID=?", [show.id]);
            blocksToDelete = dbToBlocks(rows as RowDataPacket[]);

            // Make sure that we have at least one
            if (blocksToDelete.length == 0) {
                throw "No blocks to delete";
            }

            // Delete the blocks
            let [result] = await db.execute("DELETE FROM blocks WHERE showID=?", [show.id]);

            // Process the result
            result = result as ResultSetHeader;
            if (result.affectedRows > 0) {
                return resolve(blocksToDelete);
            }
            throw "Unable to delete blocks";
        } catch (error) {
            return reject("Database error deleting blocks: " + error);
        }
    });
}
