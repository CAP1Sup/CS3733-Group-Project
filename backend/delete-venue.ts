import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { deleteVenue, deleteSections, getUser, deleteShow, getShows, beginTransaction } from "./libs/db-query";
import { errorResponse, successResponse } from "./libs/htmlResponses";
import { getVenuesJSON } from "./libs/db-conv";
import { Connection } from "mysql2/promise";

interface DeleteVenueRequest {
    email: string;
    passwd: string;
    venue: string;
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
    const request: DeleteVenueRequest = JSON.parse(event.body);

    // Check to make sure that all values are present
    if (!request.hasOwnProperty("venue") || !request.hasOwnProperty("email") || !request.hasOwnProperty("passwd")) {
        return errorResponse("Malformed request, missing parameters");
    }

    // Start the DB connection
    // Must be in a try-catch block to ensure that the errors are rolled back and the connection is closed if there's an error
    let db: Connection | undefined;
    try {
        // Create a new transaction with the DB
        db = await beginTransaction();

        // Get the user's information
        const user = await getUser(request.email, request.passwd, db);

        // Attempt to delete the venues that match the user's info
        const deletedVenue = (await deleteVenue(request.venue, user, db))[0];

        // Get the shows that match the venue
        let shows = await getShows(deletedVenue, db);

        // Delete the shows that match the venue
        for (let i = 0; i < shows.length; i++) {
            await deleteShow(user, deletedVenue, shows[i], db);
        }

        // Delete the sections that match the venue
        await deleteSections(deletedVenue, db);

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
