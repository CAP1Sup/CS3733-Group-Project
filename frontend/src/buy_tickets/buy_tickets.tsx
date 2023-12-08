import "../App.css";
import { instance, getInput } from "../main"
import { useEffect } from "react";
//import axios from "axios";

export default function BuyTickets() {
    function show_avaliable_seats() {
        const showName = show-name
        const venue = show-venue-name
        const showDate = show-date
        const showTime = show-time
        const combinedDate = new Date(showDate + "T" + showTime);

        const data = {
            "venue": venue,
            "show": showName,
            "time": combinedDate
        }
        //make request
        instance.post('/get-avaliable-seats', data).then((response) => {

            console.log(response);
        })
    }

    function purchase_seats() {
        const showName = show-name
        const venue = show-venue-name
        const showDate = show-date
        const showTime = show-time
        const combinedDate = new Date(showDate + "T" + showTime);

        const data = {
            "venue": venue,
            "show": showName,
            "time": combinedDate,
            "seats": [

            ]
        }
        //make request
        instance.post('/purchase-seats', data).then((response) => {

            console.log(response);
        })
    }

    /*useEffect(() => {
       show_avaliable_seats
       //TODO: set "await" such that following code runs after listVenues()
       const errorMessage = document.getElementById("error-message") as HTMLDivElement;
       errorMessage.innerHTML = "";
   }, []);*/

    return (
        <>
            <div>
                <h1>Buy Tickets</h1>
            </div>
            <div className="seats">
                <p>
                    <select name="Avaliable Seats" id="seats-list" size={6}>
                        <option>Seat 1</option>
                        <option>Seat 2</option>
                        <option>Seat 3</option>
                    </select>
                </p>
                <button onClick={() => purchase_seats()}>Purchase Seat</button>
            </div>
        </>
    );
}
