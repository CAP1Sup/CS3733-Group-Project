import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import axios from "axios";
import { getPassword, getUsername } from "./useLogin.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

export const instance = axios.create({
    baseURL: "https://cz4153iq4a.execute-api.us-east-1.amazonaws.com/prod",
});

export function getInput(id: string) {
    return (document.getElementById(id) as HTMLInputElement).value;
}

export function getSelect(id: string) {
    return (document.getElementById(id) as HTMLSelectElement).value;
}

export function getItemName(object: any): string {
    return object.name;
}
export function getShowTime(object: any): string {
    return new Date(object.time).toUTCString();
}

export function createOptionsList(data: any, selectedItem: string, get: Function) {
    let optionsArray = data.map(get);
    optionsArray = optionsArray.filter((n: string, i: number) => optionsArray.indexOf(n) === i);
    let optionString = "";
    for (const option of optionsArray) {
        optionString += "<option>" + option + "</option>";
    }
    const optionIndex = optionsArray.indexOf(selectedItem);
    return [optionString, optionIndex];
}

export type Show = {
    venue: string;
    show: string;
    time: string;
};

//TODO: fix this function cuz it's not good with expotrS
export function updateSelectedShow() {
    return new Promise<Show>((resolve, reject) => {
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
            .post("/list-venues", data)
            .then((response) => {
                const exportShow: Show = { venue: "", show: "", time: "" };
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
                console.log(selectedVenue);
                if (venueIndex === -1) {
                    showMenu.style.display = "none";
                    showMenu.innerHTML = "";
                    timeMenu.style.display = "none";
                    timeMenu.innerHTML = "";
                    reject("Venue not found in list");
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
                    reject("Show not found in list");
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
                    reject("Time not found in list");
                }
                timeMenu.selectedIndex = timeIndex;
                exportShow.time = getSelect("time-list");
                resolve(exportShow);
            })
            .catch((error) => {
                const errorMessage = document.getElementById("error-message") as HTMLDivElement;
                if (Object.prototype.hasOwnProperty.call(error, "response")) {
                    errorMessage.innerHTML = error.response.data;
                } else {
                    errorMessage.innerHTML = error;
                }
                console.log(error);
                return reject(error);
            });
    });
}
