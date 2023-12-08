import { instance, getInput } from "../main";
import { getPassword, getUsername } from "../useLogin";

import "../App.css";
import { useEffect } from "react";

export default function ShowReport() {
    function listVenues() {
        const email = getUsername();
        const password = getPassword();
        
        const data = {
            email: email,
            passwd: password,
        };
        //make request
        instance.post("/list-venues", data).then((response) => {
            console.log(response);
            //for each venue, create <option> element
            //let venuesStr = "";
            let showsStr = "";
            for (const venue of response.data) {
                //venuesStr += "<option>" + venue.name + "</option>";
                for (const show of venue.shows) {
                    showsStr += "<option>" + show.name + "</option>";
                }
            }

            const delete_show_list = document.getElementById("delete-show-list") as HTMLSelectElement;
            while (delete_show_list.length > 0) {
                delete_show_list.remove(delete_show_list.length - 1);
            }
            console.log(showsStr);
            delete_show_list.innerHTML = showsStr;

            const generate_show_list = document.getElementById("generate-show-list") as HTMLSelectElement;
            while (generate_show_list.length > 0) {
                generate_show_list.remove(generate_show_list.length - 1);
            }
            generate_show_list.innerHTML = showsStr;
        });
    }

    //This line runs listVenues() when the page first loads
    /*useEffect(() => {
        listVenues();
    }, []);*/

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
                <h1>Show Report</h1>
            </div>
            <label>show</label>
            <label>showTime</label>
            <label>venue</label>
            <div className="seats">
                <p>
                    <select name="Purchased Seats" id="seats-list" size={6}>
                        <option>Seat 1</option>
                        <option>Seat 2</option>
                        <option>Seat 3</option>
                    </select>
                </p>
            </div>
        </>
    );
}
