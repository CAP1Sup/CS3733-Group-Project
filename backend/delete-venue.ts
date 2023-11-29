import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { deleteVenue, deleteSections, getUser } from "./libs/db-query";
import { throwError } from "./libs/html";
import { getUserVenueJSON } from "./libs/db-conv";
import { User } from "./libs/db-types";

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
    let user: User;
    try {
        user = await getUser(request.email, request.passwd);
    } catch (error) {
        return throwError(error as string);
    }

    // Attempt to delete the venues that match the name
    try {
        const deletedVenues = await deleteVenue(request.venue, user);
        await deleteSections(deletedVenues[0]);
        // TODO: Delete all data that matches the venue ID (such as the shows and their blocks and seats)
        return {
            statusCode: 200,
            body: (await getUserVenueJSON(user)) as string,
        };
    } catch (error) {
        return throwError(error as string);
    }
};
