//import { useState } from 'react'
import { useEffect } from "react";
import "../App.css";
import { instance, getInput, getSelect } from "../main";
import { getPassword, getUsername } from "../useLogin";
import { AxiosResponse } from "axios";
import { Link } from "react-router-dom";
//import { Await } from "react-router-dom";

/**
 * This page is meant to have all of the venues.
 *
 */

export default function VenueView() {
    var exportVenue = {venue: ""};
    var exportShow = {venue: "", show: "", time: ""};

    function listVenues() {
        function getItemName(object : any): string {
            return object.name;
        }
        function getShowTime(object: any): string {
            return (new Date(object.time)).toUTCString();
        }
        
        function createOptionsList(data : any, selectedItem : string, get : Function){
            let optionsArray = data.map(get);
            optionsArray = optionsArray.filter((n : string, i : number) => optionsArray.indexOf(n) === i);
            let optionString = "";
            for (const option of optionsArray) {
                optionString += "<option>" + option + "</option>";
            }
            let optionIndex = optionsArray.indexOf(selectedItem)
            return [optionString, optionIndex];
        }

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
                exportVenue.venue = getSelect('venue-list');
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
                exportShow.show = getSelect('show-list')
                
                let times = response.data[venueIndex].shows.filter((item : any)=>{return item.name === selectedShow;});
                console.log(times);
                let [timeString, timeIndex] = createOptionsList(times, selectedTime, getShowTime);
                timeMenu.innerHTML = timeString;
                if (timeIndex === -1){
                    return;
                }
                timeMenu.selectedIndex = timeIndex;
                exportShow.time = getSelect('time-list')
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
        //TODO: set "await" such that following code runs after listVenues()
        const errorMessage = document.getElementById("error-message") as HTMLDivElement;
        errorMessage.innerHTML = "";
    }, []);

    function deleteVenue() {
        //TODO: pass info from form to backend about deleting venue
        const email = getUsername();
        const password = getPassword();
        const venueName = (document.getElementById("venue-list") as HTMLSelectElement).value;

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
        const time = new Date(getSelect("time-list"))

        const data = {
            email: email,
            passwd: password,
            venue: venue,
            show: showName,
            time: time,
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
        const combinedDate = new Date(getSelect('time-list'))

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
    function generate_show_report() {
        const email = getUsername();
        const password = getPassword();
        const venueName = getSelect('venue-list');
        const showName = getSelect('show-list');
        const combinedDate = new Date(getSelect('time-list'));

        const data = {
            email: email,
            passwd: password,
            venue: venueName,
            show: showName,
            time: combinedDate,
        };
        //make request
        instance.post("/generate-show-report", data).then((response) => {

            console.log(response);
            return response;
        }).catch((error)=>{
            console.log(error);
            return error;
        });
    }

    return (
        <>
            <div>
                <h1>Venue View!</h1>
            </div>
            <div id="error-message" className="error-message"></div>

            <div className="venues">
                <Link to="/create-venue"><button>Create Venue</button></Link>
                <Link to="/create-show" state={exportVenue}><button>Create Show</button></Link>
                <p>
                    <select name="Venues" id="venue-list" size={6} onChange={()=>listVenues()}>
                        <option>Venue 1</option>
                        <option>Venue 2</option>
                        <option>Venue 3</option>
                    </select>
                    <select name="Show" id="show-list" size={6} onChange={()=>listVenues()}>
                        <option>Show 1</option>
                        <option>Show 2</option>
                        <option>Show 3</option>
                    </select>
                    <select name="Times" id="time-list" size={6} onChange={()=>listVenues()}>
                        <option>Time 1</option>
                        <option>Time 2</option>
                        <option>Time 3</option>
                    </select>
                </p>
                <button onClick={() => deleteVenue()}>Delete Venue</button>
                <button onClick={() => activate_show()}>Activate Show</button>
                <button onClick={() => delete_show()}>Delete Show</button>
                <Link to="/edit-show" state={exportShow}><button>Edit Show</button></Link>
                <Link to="/show-report" state={exportShow}><button>Generate Show Report</button></Link>
            </div>
        </>
    );
}

