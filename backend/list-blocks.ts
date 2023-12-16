import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { beginTransaction, getShows, getUser, getVenues, venueExists } from "./libs/db-query";
import { errorResponse, successResponse } from "./libs/htmlResponses";
import { Show, Venue } from "./libs/db-types";
import { getSeatJSON } from "./libs/db-conv";
import { Connection } from "mysql2/promise";

interface ListBlocksRequest {
    email: string;
    passwd: string;
    venue: string;
    show: string;
    time: string;
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
    const request: ListBlocksRequest = JSON.parse(event.body);

    // Make sure that all required fields are present
    if (
        !request.hasOwnProperty("email") ||
        !request.hasOwnProperty("passwd") ||
        !request.hasOwnProperty("venue") ||
        !request.hasOwnProperty("show") ||
        !request.hasOwnProperty("time")
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

        // Get the venues that the user has access to
        const venues = await getVenues(user, db);

        // Check if the user's requested venue exists
        let venue: Venue;
        if (venues.some((venue) => venue.name === request.venue)) {
            venue = venues.find((venue) => venue.name === request.venue) as Venue;
        } else {
            // User doesn't have access to the venue, find out if the venue exists
            if (await venueExists(request.venue, db)) {
                throw "You're not authorized to see blocks for that show";
            }
            throw "Venue doesn't exist";
        }

        // Get all of the shows for the venue
        venue.shows = await getShows(venue, db);

        // Check if the show exists
        let show: Show;
        if (venue.shows.some((show) => show.name === request.show && show.time.toISOString() === request.time)) {
            show = venue.shows.find(
                (show) => show.name === request.show && show.time.toISOString() === request.time
            ) as Show;
        } else {
            throw "Specified show doesn't exist";
        }

        // Get the seating data for the show
        const showJSON = await getSeatJSON(venue, show, db);

        // Commit the transaction
        await db.commit();

        // Close the connection
        await db.end();

        // Return the seats in the show
        return successResponse(showJSON);
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
