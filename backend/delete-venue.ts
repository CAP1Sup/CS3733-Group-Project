import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { deleteVenue, deleteSections, getUser, deleteShows } from "./libs/db-query";
import { errorResponse, successResponse } from "./libs/htmlResponses";
import { getVenuesJSON } from "./libs/db-conv";
import { User } from "./libs/db-types";

interface DeleteVenueRequest {
    venue: string;
    email: string;
    passwd: string;
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
    if (!request.venue || !request.email || !request.passwd) {
        return errorResponse("Malformed request, missing parameters");
    }

    // Get the user's information
    let user: User;
    try {
        user = await getUser(request.email, request.passwd);
    } catch (error) {
        return errorResponse(error as string);
    }

    // Attempt to delete the venues that match the user's info
    try {
        const deletedVenues = await deleteVenue(request.venue, user);
        await deleteSections(deletedVenues[0]);
        await deleteShows(deletedVenues[0]);
        // TODO: Delete all data that matches the venue ID (such as the shows and their blocks and seats)
        return successResponse(await getVenuesJSON(user));
    } catch (error) {
        return errorResponse(error as string);
    }
};
