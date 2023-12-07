import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { errorResponse, successResponse } from "./libs/htmlResponses";
import { beginTransaction, getUser } from "./libs/db-query";
import { getVenuesJSON } from "./libs/db-conv";
import { Connection } from "mysql2/promise";

interface ListVenuesRequest {
    email: string;
    passwd: string;
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
    const request: ListVenuesRequest = JSON.parse(event.body);

    // Check to make sure that all values are present
    if (!request.hasOwnProperty("email") || !request.hasOwnProperty("passwd")) {
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

        // Get the venues that match the user's info
        const venueJSON = await getVenuesJSON(user, db);

        // Commit the transaction
        await db.commit();

        // Close the DB connection
        await db.end();

        // Return the user's venues
        return successResponse(venueJSON);
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
