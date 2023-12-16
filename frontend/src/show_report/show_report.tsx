import { instance } from "../main";
import { getPassword, getUsername } from "../useLogin";
import "../App.css";
import { useEffect } from "react";

export default function ShowReport() {
    // const location = useLocation();

    // if(location.state == null){
    //     return (
    //         <>
    //             <h1>Error: you shouldn't be here. Please select a venue from the venue viewing page to navigate here properly.</h1>
    //         </>
    //     )
    // }

    let seatInfo = new Array();

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
            const sReport = document.getElementById('shows-report') as HTMLTableElement;
            sReport.innerHTML = "<tr><th>Venue Name</th><th>Show Name</th><th>Show Time</th><th>Active?</th><th>Seats Remaining</th><th>Sales</th></tr>";
            for(const venue of response.data){
                for(const show of venue.shows){
                    let active = "Inactive";
                    console.log(seatInfo);
                    if(show.active === 1){
                        active = "Active"
                    }
                    const newRow = sReport.insertRow();
                    newRow.insertCell().textContent = venue.name;
                    newRow.insertCell().textContent = show.name;
                    newRow.insertCell().textContent = (new Date(show.time)).toString();
                    newRow.insertCell().textContent = active;
                    if(show.active === 1){
                        const data2 = {
                            email: email,
                            passwd: password,
                            venue: venue.name,
                            show: show.name,
                            time: show.time
                        }
                        instance.post('/generate-show-report', data2).then((response)=>{
                            console.log(response.data);
                            
                            let purchasedCount = 0;
                            let totalSeats = 0;
                            let totalSales = 0;
                            for(const section of response.data){
                                for(const seat of section.seats){
                                    purchasedCount += 1 - seat.purchased;
                                    totalSeats += 1;
                                    totalSales += seat.block.price * seat.purchased;
                                }
                            }
                            console.log(totalSeats)
                            seatInfo = [purchasedCount.toString() + "/" + totalSeats.toString(), '$' + totalSales.toString()];
                            newRow.insertCell().textContent = seatInfo[0];
                            newRow.insertCell().textContent = seatInfo[1];
                        }).catch((error)=>{
                            const errorMessage = document.getElementById("error-message") as HTMLDivElement;
                            if (Object.prototype.hasOwnProperty.call(error, "response")) {
                                errorMessage.innerHTML = error.response.data;
                            } else {
                                errorMessage.innerHTML = error;
                            }
                            console.log(error);
                        });
                    }
                }
            }
        }).catch((error)=>{

            const errorMessage = document.getElementById("error-message") as HTMLDivElement;
            if (Object.prototype.hasOwnProperty.call(error, "response")) {
                errorMessage.innerHTML = error.response.data;
            } else {
                errorMessage.innerHTML = error;
            }
            console.log(error);
        });
    }

    useEffect( () => {
        generate_shows_report();
    }, []);


    return (
        <>
            <div>
                <h1>Show Report</h1>
            </div>
            
            <button onClick={() => generate_shows_report()}>Show Report</button>
            <table id="shows-report"></table>
        </>
    );
}
