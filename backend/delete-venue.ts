import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ResultSetHeader } from "mysql2";
import { createPool, getUser } from "./libs/db-query";
import { throwError } from "./libs/html";
import { getUserVenueJSON } from "./libs/db-conv";

interface DeleteVenueRequest {
    venue: string;
    email: string;
    passwd: string;
}

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (event.httpMethod != "POST") {
        return {
            statusCode: 400,
            body: "Invalid request, must be a POST request",
        };
    }

    // Make sure that the request isn't empty
    if (!event.body) {
        return {
            statusCode: 400,
            body: "Malformed request, missing body. All API request data should be stringified JSON in the body of the request",
        };
    }

    // Parse the request
    const request: DeleteVenueRequest = JSON.parse(event.body);

    // Check to make sure that all values are present
    if (!request.venue || !request.email || !request.passwd) {
        return {
            statusCode: 400,
            body: "Malformed request, missing parameters",
        };
    }

    // Check if the user exists
    let userID: number;
    try {
        userID = parseInt(await getUser(request.email, request.passwd));
    } catch (error) {
        return throwError(error as string);
    }

    // Attempt to delete the venues that match the name and userID
    // Attempt to create the venue
    try {
        await deleteVenue(request.venue, userID);
        return {
            statusCode: 200,
            body: await getUserVenueJSON(request.email, request.passwd),
        };
    } catch (error) {
        return throwError(error as string);
    }
};

async function deleteVenue(venue: string, userID: number) {
    return new Promise<string>((resolve, reject) => {
        const pool = createPool();
        pool.query("DELETE FROM venues WHERE name=? AND userID=?", [venue, userID], (error, rows) => {
            // Close the connection, prevents issues with too many connections
            pool.end();
            if (error) {
                return reject("Database error deleting venue");
            }
            if (!rows) {
                return reject("No venues found");
            }
            rows = rows as ResultSetHeader;
            if (rows.affectedRows == 1) {
                return resolve("Venue deleted");
            }
            return reject("No venues found");
        });
    });
}
