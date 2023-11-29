import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { throwError } from "./libs/htmlResponses";
import { User } from "./libs/db-types";
import { getUser } from "./libs/db-query";
import { getVenuesJSON } from "./libs/db-conv";

interface ListVenuesRequest {
    email: string;
    passwd: string;
}

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Make sure that the request is a POST request
    if (event.httpMethod != "POST") {
        return throwError("Invalid request, must be a POST request");
    }

    // Make sure that the request isn't empty
    if (!event.body) {
        return {
            statusCode: 400,
            body: "Malformed request, missing body. All API request data should be stringified JSON in the body of the request",
        };
    }

    // Parse the request
    const request: ListVenuesRequest = JSON.parse(event.body);

    // Check to make sure that all values are present
    if (!request.email || !request.passwd) {
        return throwError("Malformed request, missing parameters");
    }

    // Get the user's information
    let user: User;
    try {
        user = await getUser(request.email, request.passwd);
    } catch (error) {
        return throwError(error as string);
    }

    // Return the user's venues
    try {
        return {
            statusCode: 200,
            body: await getVenuesJSON(user),
        };
    } catch (error) {
        return throwError(error as string);
    }
};
