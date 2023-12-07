import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { errorResponse, successResponse } from "./libs/htmlResponses";
import { beginTransaction } from "./libs/db-query";
import { getActiveShowsJSON } from "./libs/db-conv";
import { Connection } from "mysql2/promise";

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Make sure that the request is a POST request
    if (event.httpMethod != "GET") {
        return errorResponse("Invalid request, must be a GET request");
    }

    // Create a new transaction with the DB
    // Must be in a try-catch block to ensure that the errors are rolled back and the connection is closed if there's an error
    let db: Connection | undefined;
    try {
        // Create a new transaction with the DB
        db = await beginTransaction();

        // Get the active venues
        const activeShowsJSON = await getActiveShowsJSON(db);

        // Commit the transaction
        await db.commit();

        // Close the DB connection
        await db.end();

        // Return the active venues
        return successResponse(activeShowsJSON);
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
