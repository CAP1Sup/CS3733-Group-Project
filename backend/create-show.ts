import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { beginTransaction, createShow, getUser, getVenues, venueExists } from "./libs/db-query";
import { errorResponse, successResponse } from "./libs/htmlResponses";
import { Venue } from "./libs/db-types";
import { getSeatJSON } from "./libs/db-conv";
import { Connection } from "mysql2/promise";

interface CreateShowRequest {
    email: string;
    passwd: string;
    venue: string;
    name: string;
    time: string;
    defaultPrice: number;
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
    const request: CreateShowRequest = JSON.parse(event.body);

    // Make sure that all required fields are present
    if (
        !request.hasOwnProperty("email") ||
        !request.hasOwnProperty("passwd") ||
        !request.hasOwnProperty("venue") ||
        !request.hasOwnProperty("name") ||
        !request.hasOwnProperty("time") ||
        !request.hasOwnProperty("defaultPrice")
    ) {
        return errorResponse("Malformed request, missing required field");
    }

    // Make sure that the time is in the future
    if (Date.parse(request.time) < Date.now()) {
        return errorResponse("Time must be in the future");
    }

    // Make sure that the price is positive
    if (request.defaultPrice < 0) {
        return errorResponse("Invalid default price");
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
        const usersVenues = await getVenues(user, db);
        if (usersVenues.some((venue) => venue.name === request.venue)) {
            venue = usersVenues.find((venue) => venue.name === request.venue) as Venue;
        } else {
            // User doesn't have access to the venue, find out if the venue exists
            if (await venueExists(request.venue, db)) {
                throw "You're not authorized to make modifications to that venue";
            }
            throw "Venue doesn't exist";
        }

        // Attempt to create the show
        const show = await createShow(venue, request.name, new Date(request.time), request.defaultPrice, db);

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
