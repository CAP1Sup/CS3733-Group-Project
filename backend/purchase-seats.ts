import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { beginTransaction, getSections, getShows, getVenues, purchaseSeat, venueExists } from "./libs/db-query";
import { errorResponse, successResponse } from "./libs/htmlResponses";
import { Show, Venue } from "./libs/db-types";
import { getActiveShowsJSON } from "./libs/db-conv";
import { Connection } from "mysql2/promise";

interface PurchaseSeatsRequest {
    venue: string;
    show: string;
    time: string;
    seats: { section: string; row: string; column: string }[];
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
    const request: PurchaseSeatsRequest = JSON.parse(event.body);

    // Make sure that all required fields are present
    if (
        !request.hasOwnProperty("venue") ||
        !request.hasOwnProperty("show") ||
        !request.hasOwnProperty("time") ||
        !request.hasOwnProperty("seats") ||
        request.seats.length === 0
    ) {
        return errorResponse("Malformed request, missing required field");
    }

    // Make sure that the seats are valid
    for (let i = 0; i < request.seats.length; i++) {
        if (
            !request.seats[i].hasOwnProperty("section") ||
            !request.seats[i].hasOwnProperty("row") ||
            !request.seats[i].hasOwnProperty("column")
        ) {
            return errorResponse("Malformed request, missing required field in seats");
        }
    }

    // Start the DB connection
    // Must be in a try-catch block to ensure that the errors are rolled back and the connection is closed if there's an error
    let db: Connection | undefined;
    try {
        // Create a new transaction with the DB
        db = await beginTransaction();

        // Create an admin user
        // Quick hack to get all of the venues
        const user = { id: 0, email: "", passwd: "", isAdmin: true };

        // Check if the user's requested venue exists
        let venue: Venue;
        const userVenues = await getVenues(user, db);
        if (userVenues.some((venue) => venue.name === request.venue)) {
            venue = userVenues.find((venue) => venue.name === request.venue) as Venue;
        } else {
            // User doesn't have access to the venue, find out if the venue exists
            venueExists(request.venue, db).catch((error) => {
                throw error;
            });
            throw "You're not authorized to make modifications to that venue";
        }

        // Make sure that the venue has an ID
        if (!venue.id) {
            throw "Venue doesn't have an ID";
        }

        // Get the sections for the venue
        venue.sections = await getSections(venue.id, db);

        // Get all of the shows for the venue
        venue.shows = await getShows(venue, db);

        // Check if the show exists
        let show: Show;
        if (venue.shows.some((show) => show.name === request.show && show.time.toISOString() === request.time)) {
            show = venue.shows.find(
                (show) => show.name === request.show && show.time.toISOString() === request.time
            ) as Show;
        } else {
            throw "Specified show doesn't exist";
        }

        // Make sure that the show is in the future
        if (show.time.getTime() < Date.now()) {
            throw "Unable purchase seats for a show that's already happened";
        }

        // Edit each seat to be purchased
        for (let i = 0; i < request.seats.length; i++) {
            // Make sure that the section is between 0 and the number of sections
            const sectionIndex = parseInt(request.seats[i].section);
            if (sectionIndex < 0 || sectionIndex >= venue.sections.length) {
                throw "Invalid section in seat update request";
            }
            // TODO: Add a check to make sure that venue.sections[sectionIndex] exists
            await purchaseSeat(
                show,
                venue.sections[sectionIndex],
                parseInt(request.seats[i].row),
                parseInt(request.seats[i].column),
                db
            );
        }

        // Get the active shows
        const activeShowsJSON = await getActiveShowsJSON(db);

        // Commit the transaction
        await db.commit();

        // Close the connection
        await db.end();

        // Return the active venues
        return successResponse(activeShowsJSON);
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
