import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
    beginTransaction,
    getSections,
    getShows,
    getUser,
    getVenues,
    setSeatBlockToDefault,
    venueExists,
} from "./libs/db-query";
import { errorResponse, successResponse } from "./libs/htmlResponses";
import { Show, Venue } from "./libs/db-types";
import { getSeatJSON } from "./libs/db-conv";
import { Connection } from "mysql2/promise";

interface DeleteBlockRequest {
    email: string;
    passwd: string;
    venue: string;
    show: string;
    time: string;
    name: string;
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
    const request: DeleteBlockRequest = JSON.parse(event.body);

    // Make sure that all required fields are present
    if (
        !request.hasOwnProperty("email") ||
        !request.hasOwnProperty("passwd") ||
        !request.hasOwnProperty("venue") ||
        !request.hasOwnProperty("show") ||
        !request.hasOwnProperty("time") ||
        !request.hasOwnProperty("name")
    ) {
        return errorResponse("Malformed request, missing required field");
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

        // Set the seats from the block back to the default block
        await setSeatBlockToDefault(show, request.name, db);

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
