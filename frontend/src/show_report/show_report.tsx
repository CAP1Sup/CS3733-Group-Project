import { instance } from "../main";
import { getPassword, getUsername } from "../useLogin";
import { useLocation } from "react-router-dom";

import "../App.css";

export default function ShowReport() {
    const location = useLocation();

    if(location.state == null){
        return (
            <>
                <h1>Error: you shouldn't be here. Please select a venue from the venue viewing page to navigate here properly.</h1>
            </>
        )
    }

    //This line runs generate_show_report() when the page first loads

    function generate_shows_report() {
        const email = getUsername();
        const password = getPassword();

        const data = {
            email: email,
            passwd: password
        };
        //make request
        instance.post("/list-venues", data).then((response) => {

            console.log(response);
            const sReport = document.getElementById('shows-report') as HTMLDivElement;
            sReport.innerHTML = "<tr><th>Venue Name</th><th>Show Name</th><th>Active?</th><th>Seats Remaining</th><th>Sales</th></tr>";
            for(const venue of response.data){
                for(const show of venue.shows){
                    let active = "Inactive";
                    const showObject = single_show_report(show.name, show.time);


                    if(show.active === 1){
                        active = "Active"
                    }
                    sReport.innerHTML +="<tr><th>" + venue.name + "</th><th>" + show.name + "</th><th>" + active + "</th></tr>";
                }
            }
            return response;
        }).catch((error)=>{
            console.log(error);
            return error;
        });
    }

    function single_show_report(showName : string, showTime : string){
        const email = getUsername();
        const password = getPassword();
        const venueName = location.state.venue;
        const show = showName;
        const time = showTime;
        const data = {
            email: email,
            passwd: password,
            venue: venueName,
            show: show,
            time: time
        };
        instance.post('/generate-show-report', data).then((response)=>{
            console.log(response.data);
            let purchasedCount = 0;
            let totalSales = 0;
            let totalSeats = 0;
            for(const section of response.data){
                for(const seat of section.seats){
                    if(seat.purchased === 1){
                        purchasedCount += 1;
                        totalSales += seat.block.price;
                    }
                    totalSeats += 1;
                }
            }
            return [purchasedCount, totalSales, totalSeats];
        }).catch((error)=>{
            console.log(error)
            return error;
        })
    }

    

    return (
        <>
            <div>
                <h1>Show Report</h1>
            </div>
            
            <button onClick={() => generate_shows_report()}>Show Report</button>
            <label>Venue: {location.state.venue} </label>
            <table id="shows-report"></table>
        </>
    );
}
