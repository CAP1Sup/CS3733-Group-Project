import { useLocation } from "react-router-dom";
import "../App.css";
import { instance } from "../main";
//import { useEffect } from "react";
import "./buy_tickets.css";

type SectionInfo = {
    name: string;
    index: number;
};

export default function BuyTickets() {
    const location = useLocation();
    const sectionNames = new Array();
    function show_available_seats() {
        const data = {
            venue: location.state.venue,
            show: location.state.show,
            time: new Date(location.state.time),
        };
        //make request
        const seatList = document.getElementById("seats-list") as HTMLSelectElement;
        seatList.innerHTML = "";
        let i = 0;
        instance.post("/get-available-seats", data).then((response) => {
            for (const section of response.data) {
                const optionSection = document.createElement("OPTGROUP") as HTMLOptGroupElement;
                sectionNames.push([section.name, i]);
                for (const seat of section.seats) {
                    let isPurchased = " (Purchased)";
                    if (seat.purchased === 0) {
                        isPurchased = " (Not Purchased)";
                    }
                    const option =
                        "<option>" +
                        section.name +
                        " | Row: " +
                        seat.row +
                        ", Col: " +
                        seat.column +
                        isPurchased +
                        "</option>";
                    optionSection.innerHTML += option;
                }
                console.log(optionSection);
                seatList.add(optionSection);
                console.log(seatList)
                i += 1;
            }
        });
    }

    function purchase_seats() {
        const selectedSeats = (document.getElementById("seats-list") as HTMLSelectElement).selectedOptions;
        // console.log(selectedSeats)
        const seats = new Array();
        console.log(sectionNames);

        for (const seat of selectedSeats) {
            // console.log(seat);
            const labelString = seat.label as string;
            const [seatSect, s1] = labelString.split(" | Row: ");
            const [seatRow, s2] = s1.split(", Col: ");
            const [seatCol, s3] = s2.split(" (Not");

            console.log(sectionNames.filter((k) => k[0] == seatSect)[0][1]);
            const sectNum = sectionNames.filter((k) => k[0] == seatSect)[0][1];
            seats.push({ section: sectNum, row: seatRow, column: seatCol });
            // console.log(seatRow);
        }
        const data = {
            venue: location.state.venue,
            show: location.state.show,
            time: new Date(location.state.time),
            seats: seats,
        };
        //make request
        instance.post("/purchase-seats", data).then((response) => {
            console.log(response);
            show_available_seats();
        });
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
                <h1>Buy Tickets:</h1>
            </div>
            <button onClick={() => show_available_seats()}>Show Seats</button>
            <div className="seats">
                <p>
                    <select name="Available Seats" id="seats-list" size={6} multiple></select>
                </p>
                <button className="purchaseSeatButton" onClick={() => purchase_seats()}>
                    Purchase Seat
                </button>
            </div>
        </>
    );
}
