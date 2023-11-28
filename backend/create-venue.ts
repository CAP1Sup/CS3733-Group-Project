import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import mysql, { RowDataPacket } from "mysql2";
import { addUser, createPool, getShows, getUser, getVenues } from "./libs/db-query.ts";
import { getUserVenueJSON } from "./libs/db-conv.ts";
import { throwError } from "./libs/html.ts";

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
interface Section {
    name: string;
    rows: number;
    columns: number;
}

interface CreateVenueRequest {
    name: string;
    email: string;
    passwd: string;
    sections: Section[];
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
    const request: CreateVenueRequest = JSON.parse(event.body);

    // Check to make sure that all values are present
    if (!request.name || !request.email || !request.passwd || !request.sections) {
        return throwError("Malformed request, missing parameters");
    }

    // Check to make sure the email is valid (basically just check for @)
    if (!request.email.includes("@")) {
        return throwError("Not a valid email");
    }

    // Check to make sure the password is valid (at least 8 characters)
    if (request.passwd.length < 8) {
        return throwError("Password must be at least 8 characters");
    }

    // Check to make sure that the sections and valid
    if (request.sections.length != 3) {
        return throwError("There must be 3 sections");
    }

    // Check to make sure that the section names are unique
    const sectionNames = new Set<string>();
    for (let i = 0; i < request.sections.length; i++) {
        if (sectionNames.has(request.sections[i].name)) {
            return throwError("Duplicate section names are not allowed");
        }
        sectionNames.add(request.sections[i].name);
    }

    // Check to make sure that each of the sections has a valid name and sizing
    for (let i = 0; i < request.sections.length; i++) {
        if (!request.sections[i].name || !request.sections[i].rows || !request.sections[i].columns) {
            return throwError("Malformed request, missing parameter in section " + (i + 1));
        }

        // Check that the rows and columns are valid
        if (request.sections[i].rows < 1 || request.sections[i].columns < 1) {
            return throwError("Invalid rows or columns in section " + (i + 1));
        }
    }

    const createVenue = (request: CreateVenueRequest) => {
        return new Promise<string>(async (resolve, reject) => {
            // Get the user's ID
            let userID = undefined;
            try {
                userID = await getUser(request.email, request.passwd);
            } catch (error) {
                if (error === "No users found") {
                    try {
                        userID = addUser(request.email, request.passwd);
                    } catch (error) {
                        reject(error);
                    }
                }
            }

            const pool = createPool();
            // Create the venue in the database
            pool.query(
                "INSERT into venues(name, userID, section1Name, section1Rows, section1Cols, section2Name, section2Rows, section2Cols, section3Name, section3Rows, section3Cols) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                [
                    request.name,
                    userID,
                    request.sections[0].name,
                    request.sections[0].rows,
                    request.sections[0].columns,
                    request.sections[1].name,
                    request.sections[1].rows,
                    request.sections[1].columns,
                    request.sections[2].name,
                    request.sections[2].rows,
                    request.sections[2].columns,
                ],
                (error, rows) => {
                    pool.end();
                    if (error) {
                        if (error.code == "ER_DUP_ENTRY") {
                            return reject("The given venue already exists");
                        }
                        return reject("DB error: " + error);
                    }
                    if (!rows) {
                        return reject("No rows updated when adding venue");
                    }
                    rows = rows as mysql.ResultSetHeader;
                    if (rows.affectedRows == 1) {
                        return resolve("Venue added");
                    }
                    return reject("No rows updated when adding venue");
                }
            );
        });
    };

    // Attempt to create the venue
    try {
        await createVenue(request);
        return {
            statusCode: 200,
            body: await getUserVenueJSON(request.email, request.passwd),
        };
    } catch (error) {
        return throwError(error as string);
    }
};
