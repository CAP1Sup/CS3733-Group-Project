//import { useState } from 'react'
import { useEffect } from "react";
import "../App.css";
import { instance, getInput, getSelect } from "../main";
import { getPassword, getUsername } from "../useLogin";
//import { Await } from "react-router-dom";

/**
 * This page is meant to have all of the venues.
 *
 */

export default function VenueView() {
    //const [count, setCount] = useState(0)

    function listVenues() {
        const email = getUsername();
        const password = getPassword();

        const selectedVenue = getSelect('venue-list');
        const selectedShow = getSelect('show-list');
        const selectedTime = getSelect('time-list');


        const data = {
            email: email,
            passwd: password,
        };
        //make request
        instance
            .post("/list-venues", data)
            .then((response) => {
                console.log(response);
                //for each venue, create <option> element

                // if(selectedVenue in )
                //check if a selected venue exists
                //check if a selected show exists
                //show times in menu
                //else -> refresh shows list
                //else -> refresh venues

                let venuesStr = "";
                let showsStr = "";

                const venueMenu = document.getElementById('venue-list') as HTMLSelectElement;
                const showMenu = document.getElementById('show-list') as HTMLSelectElement;
                const timeMenu = document.getElementById('time-list') as HTMLSelectElement;


                console.log(response.data.venue);
                let venueArray = new Array();
                let venueString = "";
                for (const venue of response.data) {
                    venueArray.push(venue.name);
                    venueString += "<option>" + venue.name + "</option>";
                }
                venueMenu.innerHTML = venueString;
                if (!(selectedVenue in venueArray)) {
                    showMenu.innerHTML = "";
                    return;
                }
                if (!(selectedShow in showMenu)){
                    timeMenu.innerHTML = "";
                    return;
                }


            })
            .catch((error) => {
                const errorMessage = document.getElementById("error-message") as HTMLDivElement;
                if (Object.prototype.hasOwnProperty.call(error, "response")) {
                    errorMessage.innerHTML = error.response.data;
                } else {
                    errorMessage.innerHTML = error;
                }
                console.log(error);
            });
    }

    //This line runs listVenues() when the page first loads
    useEffect(() => {
        listVenues();
        //TODO: set "await" such that following code runs after listVenues()
        const errorMessage = document.getElementById("error-message") as HTMLDivElement;
        errorMessage.innerHTML = "";
    }, []);

    function deleteVenue() {
        //TODO: pass info from form to backend about deleting venue
        const email = getUsername();
        const password = getPassword();
        const venueName = (document.getElementById("delete-venue-list") as HTMLSelectElement).value;

        console.log(venueName);

        const data = {
            email: email,
            passwd: password,
            venue: venueName,
        };

        instance
            .post("/delete-venue", data)
            .then((response) => {
                console.log(response);
                listVenues();
            })
            .catch((error) => {
                const errorMessage = document.getElementById("error-message") as HTMLDivElement;
                errorMessage.innerHTML = error;
                console.log(error);
            });
    }

    function activate_show() {
        const email = getUsername();
        const password = getPassword();
        const showName = getSelect('show-list');
        const venue = getSelect("venue-list");
        const showDate = getInput("show-date");
        const showTime = getInput("show-time");
        const combinedDate = new Date(showDate + "T" + showTime);

        const data = {
            email: email,
            passwd: password,
            venue: venue,
            show: showName,
            time: combinedDate,
        };
        //make request
        instance
            .post("/activate-show", data)
            .then((response) => {
                console.log(response);
                listVenues();
            })
            .catch((error) => {
                const errorMessage = document.getElementById("error-message") as HTMLDivElement;
                errorMessage.innerHTML = error;
                console.log(error);
            });
    }

    function delete_show() {
        const email = getUsername();
        const password = getPassword();
        const showName = getSelect('show-list');
        const venue = getSelect("venue-list");
        const combinedDate = getSelect('time-list')

        const data = {
            email: email,
            passwd: password,
            venue: venue,
            show: showName,
            time: combinedDate,
        };
        //make request
        instance
            .post("/delete-show", data)
            .then((response) => {
                console.log(response);
                listVenues();
            })
            .catch((error) => {
                const errorMessage = document.getElementById("error-message") as HTMLDivElement;
                errorMessage.innerHTML = error;
                console.log(error);
            });
    }

    function createShowForward(): void {
        // TODO: Finish writing
        //const selectedVenue = (document.getElementById("create-show-venue-list") as HTMLSelectElement).value;
    }

    function editShowForward(): void {
        const showName = getSelect('show-list');
        const venue = getSelect("venue-list");

    }
    function generate_show_report() {
        const email = getUsername();
        const password = getPassword();
        const showName = (document.getElementById("generate-show-list") as HTMLSelectElement).value;
        const venue = getInput("show-venue-name");
        const showDate = getInput("show-date");
        const showTime = getInput("show-time");
        const combinedDate = new Date(showDate + "T" + showTime);

        const data = {
            email: email,
            passwd: password,
            venue: venue,
            show: showName,
            time: combinedDate,
        };
        //make request
        instance.post("/generate-show-report", data).then((response) => {

            console.log(response);
        });
    }

    return (
        <>
            <div>
                <h1>Venue View!</h1>
            </div>
            <div id="error-message" className="error-message"></div>

            <div className="venues">
                <a href="create-venue"><button>Create Venue</button></a>
                <a href="create-show"><button>Create Show</button></a>
                <p>
                    <select name="Venues" id="venue-list" size={6}>
                        <option>Venue 1</option>
                        <option>Venue 2</option>
                        <option>Venue 3</option>
                    </select>
                    <select name="Show" id="show-list" size={6}>
                        <option>Show 1</option>
                        <option>Show 2</option>
                        <option>Show 3</option>
                    </select>
                    <select name="Times" id="time-list" size={6}>
                        <option>Show 1</option>
                        <option>Show 2</option>
                        <option>Show 3</option>
                    </select>
                </p>
                <button onClick={() => deleteVenue()}>Delete Venue</button>
                <button onClick={() => activate_show()}>Activate Show</button>
                <button onClick={() => delete_show()}>Delete Show</button>
                <button onClick={() => editShowForward()} name="edit-show">Edit Show</button>
                <a href="show_report"><button onClick={() => generate_show_report()}>Generate Show Report</button></a>
            </div>
        </>
    );
}
