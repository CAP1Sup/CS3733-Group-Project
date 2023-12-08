import { useLocation } from "react-router-dom";
import "../App.css";
import { getSelect, instance } from "../main"
import { useEffect } from "react";
//import axios from "axios";

export default function BuyTickets() {
    const location = useLocation();
    let sectionNames = new Array();
    function show_available_seats() {
        const data = {
            "venue": location.state.venue,
            "show": location.state.show,
            "time": new Date(location.state.time)
        }
        //make request
        const seatList = document.getElementById('seats-list') as HTMLSelectElement
        instance.post('/get-available-seats', data).then((response) => {
            let i = 0;
            for(const section of response.data){
                var optionSection = document.createElement("OPTGROUP") as HTMLOptGroupElement;
                console.log(section);
                sectionNames.push([section.name, i]);
                for(const seat of section.seats){
                    let isPurchased = " (Purchased)";
                    if (seat.purchased === 0){
                        isPurchased = " (Not Purchased)"
                    }
                    let option = "<option>" + section.name + " | Row: " + seat.row + ", Col: " + seat.column + isPurchased + "</option>";
                    optionSection.innerHTML += option;
                }
                seatList.add(optionSection);
            }
        })
    }

    function purchase_seats() {
        const selectedSeats = (document.getElementById('seats-list') as HTMLSelectElement).selectedOptions;
        // console.log(selectedSeats)
        const seats = new Array();
        console.log(sectionNames)

        for(const seat of selectedSeats){
            // console.log(seat);
            const labelString = seat.label as string
            const [seatSect, s1] = labelString.split(' | Row: ');
            const [seatRow, s2] = s1.split(', Col: ');
            const [seatCol, s3] = s2.split(' (Not');

            console.log(sectionNames.filter((k)=>k[0] == seatSect)[0][1])
            const sectNum = sectionNames.filter((k)=>k[0] == seatSect)[0][1];
            seats.push({section:sectNum, row:seatRow, column:seatCol});
            // console.log(seatRow);
        }
        
        
        const data = {
            "venue": location.state.venue,
            "show": location.state.show,
            "time": new Date(location.state.time),
            "seats": seats
        }
        //make request
        instance.post('/purchase-seats', data).then((response) => {

            console.log(response);
        })
    }

//     useEffect(() => {
//        show_avaliable_seats();
//        //TODO: set "await" such that following code runs after listVenues()
//        const errorMessage = document.getElementById("error-message") as HTMLDivElement;
//        errorMessage.innerHTML = "";
//    }, []);

    return (
        <>
            <div>
                <h1>Buy Tickets</h1>
            </div>
            <button onClick={() => show_available_seats()}>Show Seats</button>
            <div className="seats">
                <p>
                    <select name="Avaliable Seats" id="seats-list" size={6} multiple>
                    </select>
                </p>
                <button onClick={() => purchase_seats()}>Purchase Seat</button>
            </div>
        </>
    );
}
