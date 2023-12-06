import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createUser, getUser, createSection, createVenue, beginTransaction } from "./libs/db-query.ts";
import { getVenuesJSON } from "./libs/db-conv.ts";
import { errorResponse, successResponse } from "./libs/htmlResponses.ts";
import { Section, User } from "./libs/db-types.ts";
import { Connection } from "mysql2/promise";

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

interface CreateVenueRequest {
    name: string;
    email: string;
    passwd: string;
    sections: Section[];
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
    const request: CreateVenueRequest = JSON.parse(event.body);

    // Check to make sure that all values are present
    if (!request.name || !request.email || !request.passwd || !request.sections) {
        return errorResponse("Malformed request, missing parameters");
    }

    // Check to make sure the email is valid (basically just check for @)
    if (!request.email.includes("@")) {
        return errorResponse("Not a valid email");
    }

    // Check to make sure the password is valid (at least 8 characters)
    if (request.passwd.length < 8) {
        return errorResponse("Password must be at least 8 characters");
    }

    // Check to make sure that the section names are unique
    const sectionNames = new Set<string>();
    for (let i = 0; i < request.sections.length; i++) {
        if (sectionNames.has(request.sections[i].name)) {
            return errorResponse("Duplicate section names are not allowed");
        }
        sectionNames.add(request.sections[i].name);
    }

    // Check to make sure that each of the sections has a valid name and sizing
    for (let i = 0; i < request.sections.length; i++) {
        if (!request.sections[i].name || !request.sections[i].rows || !request.sections[i].columns) {
            return errorResponse("Malformed request, missing parameter in section " + (i + 1));
        }

        // Check that the rows and columns are valid
        if (request.sections[i].rows < 1 || request.sections[i].columns < 1) {
            return errorResponse("Invalid rows or columns in section " + (i + 1));
        }
    }

    // Start the DB connection
    // Must be in a try-catch block to ensure that the errors are rolled back and the connection is closed if there's an error
    let db: Connection | undefined;
    try {
        // Create a new transaction with the DB
        db = await beginTransaction();

        // Get the user's information
        let user: User;
        try {
            user = await getUser(request.email, request.passwd, db);
        } catch (error) {
            if (error === "User doesn't exist") {
                user = await createUser(request.email, request.passwd, false, db);
            } else {
                throw error;
            }
        }

        // Attempt to create the venue
        const venue = await createVenue(request.name, user, db);
        for (let i = 0; i < request.sections.length; i++) {
            await createSection(
                venue,
                request.sections[i].name,
                request.sections[i].rows,
                request.sections[i].columns,
                db
            );
        }

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
