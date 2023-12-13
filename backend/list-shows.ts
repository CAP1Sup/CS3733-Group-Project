import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { errorResponse, successResponse } from "./libs/htmlResponses";
import { beginTransaction, getUser, getVenues, venueExists } from "./libs/db-query";
import { getVenueShowsJSON } from "./libs/db-conv";
import { Connection } from "mysql2/promise";
import { Venue } from "./libs/db-types";

interface ListShowsRequest {
    email: string;
    passwd: string;
    venue: string;
}

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Make sure that the request is a POST request
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
    const request: ListShowsRequest = JSON.parse(event.body);

    // Check to make sure that all values are present
    if (!request.hasOwnProperty("email") || !request.hasOwnProperty("passwd") || !request.hasOwnProperty("venue")) {
        return errorResponse("Malformed request, missing parameters");
    }

    // Create a new transaction with the DB
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

        // Get the shows at the venue
        const venueShowJSON = await getVenueShowsJSON(venue, db);

        // Commit the transaction
        await db.commit();

        // Close the DB connection
        await db.end();

        // Return the user's venues
        return successResponse(venueShowJSON);
    } catch (error) {
        // Roll back the transaction, there was an error
        if (db) {
            await db.rollback();
            await db.end();
        }

        // Return the error
        return errorResponse(error as string);
    }
};
