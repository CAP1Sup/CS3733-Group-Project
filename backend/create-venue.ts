import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import mysql from 'mysql';
import { dbConfig } from './db-access.ts';

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
    cols: number;
}

interface CreateVenueRequest {
    name: string;
    email: string;
    passwd: string;
    sections: Section[];
}

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Make sure that the request isn't empty
    if (!event.body) {
        return {
            statusCode: 400,
            body: 'Malformed request, missing body',
        };
    }

    // Parse the request
    const request: CreateVenueRequest = JSON.parse(event.body);

    // Check to make sure that all values are present
    if (!request.name || !request.email || !request.passwd || !request.sections) {
        return {
            statusCode: 400,
            body: 'Malformed request, missing parameters',
        };
    }

    // Check to make sure the email is valid (basically just check for @)
    if (!request.email.includes('@')) {
        return {
            statusCode: 400,
            body: 'Not a valid email',
        };
    }

    // Check to make sure the password is valid (at least 8 characters)
    if (request.passwd.length < 8) {
        return {
            statusCode: 400,
            body: 'Password must be at least 8 characters',
        };
    }

    // Check to make sure that the sections and valid
    if (request.sections.length != 3) {
        return {
            statusCode: 400,
            body: 'There must be 3 sections',
        };
    }

    // Check to make sure that each of the sections has a valid name and sizing
    for (let i = 0; i < request.sections.length; i++) {
        if (!request.sections[i].name || !request.sections[i].rows || !request.sections[i].cols) {
            return {
                statusCode: 400,
                body: 'Malformed request, missing parameter in section ${i + 1}',
            };
        }

        // Check that the rows and columns are valid
        if (request.sections[i].rows < 1 || request.sections[i].cols < 1) {
            return {
                statusCode: 400,
                body: 'Rows and columns must be positive',
            };
        }
    }

    // Get credentials from the dbAccess layer (loaded separately via AWS console)
    const pool = mysql.createPool({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.passwd,
        database: dbConfig.database,
    });

    // Get the user's ID from the database
    const getUserID = (email: string, passwd: string) => {
        return new Promise((resolve, reject) => {
            pool.query('SELECT ID FROM users WHERE email=? AND password=?', [email, passwd], (error, rows) => {
                if (error) {
                    return reject(error);
                }
                if (rows && rows.length == 1) {
                    return resolve(rows[0].id);
                } else {
                    // No user found, create one
                    pool.query('INSERT into users(email, passwd) VALUES(?,?)', [email, passwd], (error, rows) => {
                        if (error) {
                            return reject(error);
                        }
                        if (rows && rows.affectedRows == 1) {
                            return resolve(getUserID(email, passwd));
                        } else {
                            return reject('Unable to add user');
                        }
                    });
                }
            });
        });
    };

    const createVenue = (request: CreateVenueRequest) => {
        return new Promise((resolve, reject) => {
            // Get the user's ID
            const userID = getUserID(request.email, request.passwd);
            pool.query(
                'INSERT into venues(name, userID, section1Name, section1Rows, section1Cols, section2Name, section2Rows, section2Cols, section3Name, section3Rows, section3Cols) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
                [
                    request.name,
                    userID,
                    request.sections[0].name,
                    request.sections[0].rows,
                    request.sections[0].cols,
                    request.sections[1].name,
                    request.sections[1].rows,
                    request.sections[1].cols,
                    request.sections[2].name,
                    request.sections[2].rows,
                    request.sections[2].cols,
                ],
                (error, rows) => {
                    if (error) {
                        return reject(error);
                    }
                    if (rows && rows.affectedRows == 1) {
                        return resolve(true);
                    } else {
                        return resolve(false);
                    }
                },
            );
        });
    };

    let response = undefined;

    // Attempt to create the venue
    if (await createVenue(request)) {
        response = {
            statusCode: 200,
            body: 'Successfully created venue',
        };
    } else {
        response = {
            statusCode: 400,
            body: 'Unable to create venue',
        };
    }

    pool.end(); // done with DB
    return response;
};