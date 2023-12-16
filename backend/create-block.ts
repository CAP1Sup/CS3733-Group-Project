import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
    beginTransaction,
    createBlock,
    getSections,
    getShows,
    getUser,
    getVenues,
    setSeatBlock,
    venueExists,
} from "./libs/db-query";
import { errorResponse, successResponse } from "./libs/htmlResponses";
import { Show, Venue } from "./libs/db-types";
import { getSeatJSON } from "./libs/db-conv";
import { Connection } from "mysql2/promise";

interface CreateBlockRequest {
    email: string;
    passwd: string;
    venue: string;
    show: string;
    time: string;
    name: string;
    price: number;
    seats: { section: string; row: string; column: string }[];
}

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (event.httpMethod != "POST") {
        return errorResponse("Invalid request, must be a POST request");
    }

    // Make sure that the request isn't empty
    if (!event.body) {
        return errorResponse(
            "Malformed request, missing body. All API request data should be stringified JSON in the body of the request"
        );
    }

    // Parse the request
    const request: CreateBlockRequest = JSON.parse(event.body);

    // Make sure that all required fields are present
    if (
        !request.hasOwnProperty("email") ||
        !request.hasOwnProperty("passwd") ||
        !request.hasOwnProperty("venue") ||
        !request.hasOwnProperty("show") ||
        !request.hasOwnProperty("time") ||
        !request.hasOwnProperty("name") ||
        !request.hasOwnProperty("price") ||
        !request.hasOwnProperty("seats") ||
        request.seats.length === 0
    ) {
        return errorResponse("Malformed request, missing required field");
    }

    // Make sure that the seats are valid
    for (let i = 0; i < request.seats.length; i++) {
        if (
            !request.seats[i].hasOwnProperty("section") ||
            !request.seats[i].hasOwnProperty("row") ||
            !request.seats[i].hasOwnProperty("column")
        ) {
            return errorResponse("Malformed request, missing required field in seats");
        }
    }

    // Make sure that the price is positive
    if (request.price < 0) {
        return errorResponse("Invalid price");
    }

    // Start the DB connection
    // Must be in a try-catch block to ensure that the errors are rolled back and the connection is closed if there's an error
    let db: Connection | undefined;
    try {
        // Create a new transaction with the DB
        db = await beginTransaction();

        // Get the user's information
        const user = await getUser(request.email, request.passwd, db);

        // Check if the user is authorized for the given venue
        let venue: Venue;
        const userVenues = await getVenues(user, db);
        if (userVenues.some((venue) => venue.name === request.venue)) {
            venue = userVenues.find((venue) => venue.name === request.venue) as Venue;
        } else {
            // User doesn't have access to the venue, find out if the venue exists
            venueExists(request.venue, db).catch((error) => {
                throw error;
            });
            throw "You're not authorized to make modifications to that venue";
        }

        // Make sure that the venue has an ID
        if (!venue.id) {
            throw "Venue doesn't have an ID";
        }

        // Get the sections for the venue
        venue.sections = await getSections(venue.id, db);

        // Check if the show exists
        let show: Show;
        venue.shows = await getShows(venue, db);
        if (venue.shows.some((show) => show.name === request.show && show.time.toISOString() === request.time)) {
            show = venue.shows.find(
                (show) => show.name === request.show && show.time.toISOString() === request.time
            ) as Show;
        } else {
            throw "Specified show doesn't exist";
        }

        // Make sure that the show isn't active
        if (show.active) {
            throw "Show is already active";
        }

        // Create the block
        const block = await createBlock(show, request.name, request.price, db);

        // Add the new block to each seat
        for (let i = 0; i < request.seats.length; i++) {
            // Make sure that the section is between 0 and the number of sections
            const sectionIndex = parseInt(request.seats[i].section);
            if (sectionIndex < 0 || sectionIndex >= venue.sections.length) {
                throw "Invalid section in block update request's seats";
            }
            // TODO: Add a check to make sure that venue.sections[sectionIndex] exists
            await setSeatBlock(
                show,
                venue.sections[sectionIndex],
                parseInt(request.seats[i].row),
                parseInt(request.seats[i].column),
                block,
                db
            );
        }

        // Get the active venues
        const seatJSON = await getSeatJSON(venue, show, db);

        // Commit the transaction
        await db.commit();

        // Close the connection
        await db.end();

        // Return the active venues
        return successResponse(seatJSON);
    } catch (error) {
        // Rollback the transaction, there was an error
        if (db) {
            await db.rollback();
            await db.end();
        }

        // Return the error
        return errorResponse(error as string);
    }
};
