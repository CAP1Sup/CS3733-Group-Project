import { instance, getInput } from "../main";
import { getPassword, getUsername } from "../useLogin";
import { useLocation } from "react-router-dom";

import "../App.css";
import { useEffect } from "react";

export default function ShowReport() {
    const location = useLocation();

    //This line runs listVenues() when the page first loads
    useEffect(() => {
        generate_show_report();
    }, []);

    function generate_show_report() {
        const email = getUsername();
        const password = getPassword();
        const showName = location.state.show;
        const venue = location.state.venue;
        const combinedDate = new Date(location.state.time);

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
