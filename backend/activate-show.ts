import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getVenuesJSON } from "./libs/db-conv";
import { activateShow, beginTransaction, getShows, getUser, getVenues, venueExists } from "./libs/db-query";
import { Show, Venue } from "./libs/db-types";
import { errorResponse, successResponse } from "./libs/htmlResponses";
import { Connection } from "mysql2/promise";

interface ActivateShowRequest {
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
    const request: ActivateShowRequest = JSON.parse(event.body);

    // Make sure that all required fields are present
    if (!request.email || !request.passwd || !request.venue || !request.show || !request.time) {
        return errorResponse("Malformed request, missing required field");
    }

    // Start the DB connection
    // Must be in a try-catch block to ensure that the errors are rolled back and the connection is closed if there's an error
    let db: Connection | undefined;
    try {
        // Create a new transaction with the DB
        db = await beginTransaction();

        // Get the user's information
        let user = await getUser(request.email, request.passwd, db);

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

        // Attempt to delete the show
        await activateShow(venue, show, db);

        // Get the venues that match the user's info
        const venueJSON = await getVenuesJSON(user, db);

        // Commit the transaction
        await db.commit();

        // Close the connection
        await db.end();

        // Return the updated list of venues
        return successResponse(venueJSON);
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
