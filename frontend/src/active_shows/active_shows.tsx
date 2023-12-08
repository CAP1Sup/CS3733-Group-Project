import { Link } from "react-router-dom";
import "../App.css";
import { instance, getInput, createOptionsList, getItemName, getSelect, getShowTime } from "../main";
import { useEffect } from "react";

export default function ActiveShows() {
    let exportShow = {venue: "", show: "", time: ""}
    function search_shows() {

        const searchQuery = getInput("search");

        const data = {
            "query": searchQuery
        }
        //make request
        instance.post('/search-shows', data).then((response) => {

            console.log(response);
            const search_results = document.getElementById("search-response") as HTMLDivElement
            let results_string = "";
            for (const v of response.data) {

                for (const s of v.shows) {
                    results_string += s.name + "\n";
                }
            }
            search_results.innerHTML = results_string;
        })
    }

    function list_active_shows() {
        const selectedVenue = getSelect('venue-list');
        const selectedShow = getSelect('show-list');
        const selectedTime = getSelect('time-list');

        //make request
        instance.get("/list-active-shows").then((response) => {
            console.log(response);
            const venueMenu = document.getElementById('venue-list') as HTMLSelectElement;
            const showMenu = document.getElementById('show-list') as HTMLSelectElement;
            const timeMenu = document.getElementById('time-list') as HTMLSelectElement;

            console.log("e")

            console.log(response.data);
            let [venueString, venueIndex] = createOptionsList(response.data, selectedVenue, getItemName);
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
            //Selected venue still exists in list, reselect and then move on

            venueMenu.selectedIndex = venueIndex;
            exportShow.venue = getSelect('venue-list');

            let [showString, showIndex] = createOptionsList(response.data[venueIndex].shows, selectedShow, getItemName);
            console.log(showIndex)
            showMenu.innerHTML = showString;
            if (showIndex === -1) {
            timeMenu.style.display = "none";
            timeMenu.innerHTML = "";
            return;
            }
            timeMenu.style.display = "inline";
            showMenu.selectedIndex = showIndex;
            exportShow.show = getSelect('show-list');

            let times = response.data[venueIndex].shows.filter((item: any) => { return item.name === selectedShow; });
            console.log(times);
            let [timeString, timeIndex] = createOptionsList(times, selectedTime, getShowTime);
            timeMenu.innerHTML = timeString;
            if (timeIndex === -1) {
            return;
            }
            timeMenu.selectedIndex = timeIndex;
            exportShow.time = getSelect('time-list');
            console.log(exportShow);
            return;
        });
    }

    useEffect(() => {
        list_active_shows();
    }, []);


    return (
        <>
            <div>
                <h1>Active Shows</h1>
            </div>
            <div className="activeShows">
            <p>
                    <select name="Venues" id="venue-list" size={6} onChange={() => list_active_shows()}>
                    </select>
                    <select name="Show" id="show-list" size={6} onChange={() => list_active_shows()}>
                    </select>
                    <select name="Times" id="time-list" size={6} onChange={() => list_active_shows()}>
                    </select>
                </p>
            <button onClick={(e) => { e.preventDefault(); list_active_shows() }}>Active Shows</button>

                <Link to="/buy-tickets" state={exportShow}><button>Select Seats</button></Link>
            </div>
            <input id="search" type="text" />
            <button onClick={() => search_shows()}>Search</button>

            <div id="search-response"></div>
        </>
    );
}
