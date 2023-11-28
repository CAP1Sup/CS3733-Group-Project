import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { createPool, deleteSections, getUser } from "./libs/db-query";
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
        userID = await getUser(request.email, request.passwd);
    } catch (error) {
        return throwError(error as string);
    }

    // Attempt to delete the venues that match the name and userID
    // Attempt to create the venue
    try {
        const deletedVenues = await deleteVenue(request.venue, userID);
        await deleteSections(deletedVenues[0].ID);
        // TODO: Delete all data that matches the venue ID (such as the shows and their blocks and seats)
        return {
            statusCode: 200,
            body: (await getUserVenueJSON(request.email, request.passwd)) as string,
        };
    } catch (error) {
        return throwError(error as string);
    }
};

async function deleteVenue(venue: string, userID: number) {
    return new Promise<RowDataPacket[]>((resolve, reject) => {
        const pool = createPool();
        let venuesToDelete: RowDataPacket[];
        pool.execute("SELECT * FROM venues WHERE name=? AND userID=?", [venue, userID], (error, rows) => {
            // Close the connection, prevents issues with too many connections
            if (error) {
                pool.end();
                return reject("Database error deleting venue: " + error);
            }
            if (!rows) {
                pool.end();
                return reject("You're not authorized to make modifications to that venue");
            }
            venuesToDelete = rows as RowDataPacket[];
        });
        pool.execute("DELETE FROM venues WHERE name=? AND userID=?", [venue, userID], (error, result) => {
            // Close the connection, prevents issues with too many connections
            pool.end();
            if (error) {
                return reject("Database error deleting venue: " + error);
            }

            // Process the result
            result = result as ResultSetHeader;
            if (!result) {
                return reject("You're not authorized to make modifications to that venue");
            }
            if (result.affectedRows > 0) {
                return resolve(venuesToDelete);
            }
            return reject("You're not authorized to make modifications to that venue");
        });
    });
}
