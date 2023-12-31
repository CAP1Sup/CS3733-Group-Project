import { Link } from "react-router-dom";
import "../App.css";
import { instance, getInput, createOptionsList, getItemName, getSelect, getShowTime, createTimeOptionsList } from "../main";
import { useEffect } from "react";
import "./active_shows.css";

export default function ActiveShows() {
    const exportShow = { venue: "", show: "", time: "" };
    function search_shows() {
        const searchQuery = getInput("search");

        const data = {
            query: searchQuery,
        };
        //make request
        instance.post("/search-shows", data).then((response) => {
            console.log(response);
            const search_results = document.getElementById("search-response") as HTMLDivElement;
            search_results.innerHTML = '';
            const results = document.createElement('ul') as HTMLUListElement;
            for (const v of response.data) {
                for (const s of v.shows) {
                    const y = document.createElement('LI');
                    y.appendChild(document.createTextNode(s.name.toString()));
                    results.appendChild(y);
                }
            }
            search_results.appendChild(results);
        });
    }

    function list_active_shows() {
        const selectedVenue = getSelect("venue-list");
        const selectedShow = getSelect("show-list");
        const selectedTime = getSelect("time-list");

        //make request
        instance.get("/list-active-shows").then((response) => {
            console.log(response);
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
            //Selected venue still exists in list, reselect and then move on

            venueMenu.selectedIndex = venueIndex;
            exportShow.venue = getSelect("venue-list");

            const [showString, showIndex] = createOptionsList(
                response.data[venueIndex].shows,
                selectedShow,
                getItemName
            );
            console.log(showIndex);
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
            const [timeString, timeIndex] = createTimeOptionsList(times, selectedTime, getShowTime);
            timeMenu.innerHTML = timeString as string;
            for(const option of timeMenu.options){
                const data = {
                    venue: selectedVenue,
                    show: selectedShow,
                    time: new Date(option.textContent as string)
                };
    
                instance.post("/get-available-seats", data).then((response)=>{
                   let soldOut = true;
                   for(const section of response.data){
                        for(const seat of section.seats){
                            if(seat.purchased === 0){
                                soldOut = false;
                            }
                        }
                   } 
                   if(soldOut && !option.textContent?.endsWith('(SOLD OUT)')){
                        option.textContent += ' (SOLD OUT)'
                   }
                });
            }
            if (timeIndex === -1) {
                return;
            }
            timeMenu.selectedIndex = timeIndex as number;
            exportShow.time = getSelect("time-list");
            console.log(exportShow);

            //TODO: disable options where the show is already sold out, and indicate that it is sold out

            return;
        });
    }

    useEffect(() => {
        list_active_shows();
    }, []);

    return (
        <>
            <div>
                <h1>Active Shows:</h1>
            </div>
            <div className="activeShows">
                <p>
                    <select name="Venues" id="venue-list" size={6} onChange={() => list_active_shows()}></select>
                    <select name="Show" id="show-list" size={6} onChange={() => list_active_shows()}></select>
                    <select name="Times" id="time-list" size={6} onChange={() => list_active_shows()}></select>
                </p>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        list_active_shows();
                    }}
                >
                    Get Active Shows
                </button>

                <Link to="/buy-tickets" state={exportShow}>
                    <button className="selectseatsButton">Select Seats</button>
                </Link>
            </div>
            <input id="search" type="text" />
            <button className="searchButton" onClick={() => search_shows()}>
                Search
            </button>

            <div id="search-response"></div>
        </>
    );
}
