import { createOptionsList, getItemName, getShowTime, instance } from "../main";
import { Link } from "react-router-dom";
import { getPassword, getUsername } from "../useLogin";
import { getSelect } from "../main";
import "./all_shows.css";

import "../App.css";
import { useEffect } from "react";

export default function AllShows() {
    const exportVenue = { venue: "" };
    const exportShow = {
        venue: "",
        show: "",
        time: "",
    };

    function listVenues() {
        const email = getUsername();
        const password = getPassword();

        const selectedVenue = getSelect("venue-list");
        const selectedShow = getSelect("show-list");
        const selectedTime = getSelect("time-list");

        const data = {
            email: email,
            passwd: password,
        };
        //make request
        instance
            .post("/list-venues", data) //TODO: For some reason, this request is giving back empty shows with no time
            .then((response) => {
                console.log(response);
                //for each venue, create <option> element

                // if(selectedVenue in )
                //check if a selected venue exists
                //check if a selected show exists
                //show times in menu
                //else -> refresh shows list
                //else -> refresh venues

                const venueMenu = document.getElementById("venue-list") as HTMLSelectElement;
                const showMenu = document.getElementById("show-list") as HTMLSelectElement;
                const timeMenu = document.getElementById("time-list") as HTMLSelectElement;

                console.log("e");

                console.log(response.data);
                const [venueString, venueIndex] = createOptionsList(response.data, selectedVenue, getItemName);
                venueMenu.innerHTML = venueString;
                if (venueIndex === -1) {
                    showMenu.style.display = "none";
                    showMenu.innerHTML = "";
                    timeMenu.style.display = "none";
                    timeMenu.innerHTML = "";
                    return;
                }

                showMenu.style.display = "inline";
                timeMenu.style.display = "inline";

                venueMenu.selectedIndex = venueIndex;
                exportVenue.venue = getSelect("venue-list");
                exportShow.venue = getSelect("venue-list");

                const [showString, showIndex] = createOptionsList(
                    response.data[venueIndex].shows,
                    selectedShow,
                    getItemName
                );
                console.log(showIndex);
                //TODO: for some reason it's listing shows with no information, will fix later, not important currently
                showMenu.innerHTML = showString;
                if (showIndex === -1) {
                    timeMenu.style.display = "none";
                    timeMenu.innerHTML = "";
                    return;
                }
                timeMenu.style.display = "inline";
                showMenu.selectedIndex = showIndex;
                exportShow.show = getSelect("show-list");

                const times = response.data[venueIndex].shows.filter((item: any) => {
                    return item.name === selectedShow;
                });
                console.log(times);
                const [timeString, timeIndex] = createOptionsList(times, selectedTime, getShowTime);
                timeMenu.innerHTML = timeString;
                if (timeIndex === -1) {
                    return;
                }
                timeMenu.selectedIndex = timeIndex;
                exportShow.time = getSelect("time-list");
                return;
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
    }, []);

    function delete_show() {
        const email = getUsername();
        const password = getPassword();
        const showName = getSelect("show-list");
        const venue = getSelect("venue-list");
        const combinedDate = new Date(getSelect("time-list"));

        const data = {
            email: email,
            passwd: password,
            venue: venue,
            show: showName,
            time: combinedDate,
        };
        //make request
        instance.post("/delete-show", data).then((response) => {
            console.log(response);
            listVenues();
        });
    }

    return (
        <>
            <div>
                <h1>All Shows</h1>
            </div>
            <p>
                <select name="Venues" id="venue-list" size={6} onChange={() => listVenues()}></select>
                <select name="Show" id="show-list" size={6} onChange={() => listVenues()}></select>
                <select name="Times" id="time-list" size={6} onChange={() => listVenues()}></select>
            </p>
            <button onClick={() => delete_show()}>Delete Show</button>
            <Link to={"/show-report"} state={exportShow}>
                <button>Generate Show Report</button>
            </Link>
        </>
    );
}
