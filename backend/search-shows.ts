import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { errorResponse, successResponse } from "./libs/htmlResponses";
import { beginTransaction } from "./libs/db-query";
import { getMatchingNamesJSON } from "./libs/db-conv";
import { Connection } from "mysql2/promise";

interface SearchShowsRequest {
    query: string;
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
    const request: SearchShowsRequest = JSON.parse(event.body);

    // Make sure that all required fields are present
    if (!request.hasOwnProperty("query")) {
        return errorResponse("Malformed request, missing required field");
    }

    // Create a new transaction with the DB
    // Must be in a try-catch block to ensure that the errors are rolled back and the connection is closed if there's an error
    let db: Connection | undefined;
    try {
        // Create a new transaction with the DB
        db = await beginTransaction();

        // Get the venues and shows that match the query
        const matchingNamesJSON = await getMatchingNamesJSON(request.query, db);

        // Commit the transaction
        await db.commit();

        // Close the DB connection
        await db.end();

        // Return the active venues
        return successResponse(matchingNamesJSON);
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
