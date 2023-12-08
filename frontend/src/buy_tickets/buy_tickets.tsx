import "../App.css";
import {instance, getInput} from "../main"
//import axios from "axios";

export default function BuyTickets() {
    function show_avaliable_seats() {
         const showName = show-name
         const venue = show-venue-name
         const showDate = show-date
         const showTime = show-time
         const combinedDate = new Date(showDate + "T" + showTime);

         const data = {
             "venue" : venue,
             "show" : showName,
             "time" : combinedDate
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
             "venue" : venue,
             "show" : showName,
             "time" : combinedDate,
             "seats" :[
                 
             ]
         }
         //make request
         instance.post('/purchase-seats', data).then((response) => {

             console.log(response);
         })
     }

    return (
        <>
            <div>
                <h1>Hi!</h1>
            </div>
        </>
    );
}
