import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createShow, getUser, getVenues, venueExists } from "./libs/db-query";
import { errorResponse, successResponse } from "./libs/htmlResponses";
import { User, Venue } from "./libs/db-types";
import { getShowJSON } from "./libs/db-conv";

interface CreateShowRequest {
    email: string;
    passwd: string;
    venue: string;
    name: string;
    time: Date;
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
        !request.email ||
        !request.passwd ||
        !request.venue ||
        !request.name ||
        !request.time ||
        !request.defaultPrice
    ) {
        return errorResponse("Malformed request, missing required field");
    }

    // Make sure that the time is in the future
    /*
    if (request.time < new Date()) {
        return errorResponse("Invalid time");
    }*/

    // Make sure that the price is positive
    if (request.defaultPrice < 0) {
        return errorResponse("Invalid default price");
    }

    // Get the user's information
    let user: User;
    try {
        user = await getUser(request.email, request.passwd);
    } catch (error) {
        return errorResponse(error as string);
    }

    // Check if the user is authorized for the given venue
    let venue: Venue;
    try {
        const userVenues = await getVenues(user);
        if (userVenues.some((venue) => venue.name === request.venue)) {
            venue = userVenues.find((venue) => venue.name === request.venue) as Venue;
        } else {
            // User doesn't have access to the venue, find out if the venue exists
            venueExists(request.venue).catch((error) => {
                return errorResponse(error);
            });
            return errorResponse("You're not authorized to make modifications to that venue");
        }
    } catch (error) {
        return errorResponse(error as string);
    }

    // Attempt to create the show
    try {
        const show = await createShow(venue, request.name, request.time, request.defaultPrice);
        // TODO: Create all of the blocks and seats for the show
        // TODO: Return all of the seats for the show instead of just the show

        return successResponse(await getShowJSON(show));
    } catch (error) {
        return errorResponse(error as string);
    }
};
