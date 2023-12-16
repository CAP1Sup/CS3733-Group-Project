import { Link, useLocation } from "react-router-dom";
import "../App.css";
import { instance } from "../main";
//import { useEffect } from "react";
import "./buy_tickets.css";
import { useEffect } from "react";


export default function BuyTickets() {
    const location = useLocation();
    if(location.state == null || location.state.venue == "" || location.state.show == "" || location.state.time == ""){
        return (
            <>
                <h1>Error: you shouldn't be here. Please select a venue, show and time from <Link to='/active-shows'>here</Link> to navigate here properly.</h1>
            </>
        )
    }

    function sortTable(n : number) {
        let switchcount = 0;
        const table = document.getElementById("seats-list") as HTMLTableElement;
        let switching = true;
        let i = 0;
        //Set the sorting direction to ascending:
        let dir = "asc"; 
        /*Make a loop that will continue until
        no switching has been done:*/
        while (switching) {
          //start by saying: no switching is done:
          switching = false;
          const rows = table.rows as HTMLCollectionOf<HTMLTableRowElement>;
          /*Loop through all table rows (except the
          first, which contains table headers):*/
          let shouldSwitch = false;
          for (i = 1; i < (rows.length - 1); i++) {
            //start by saying there should be no switching:
            /*Get the two elements you want to compare,
            one from current row and one from the next:*/
            const x = rows[i].getElementsByTagName("TD")[n];
            const y = rows[i + 1].getElementsByTagName("TD")[n];
            /*check if the two rows should switch place,
            based on the direction, asc or desc:*/
            if (dir == "asc") {
              if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                //if so, mark as a switch and break the loop:
                shouldSwitch= true;
                break;
              }
            } else if (dir == "desc") {
              if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                //if so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
              }
            }
          }
          if (shouldSwitch) {
            /*If a switch has been marked, make the switch
            and mark that a switch has been done:*/
            rows[i].parentNode?.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            //Each time a switch is done, increase this count by 1:
            switchcount ++;      
          } else {
            /*If no switching has been done AND the direction is "asc",
            set the direction to "desc" and run the while loop again.*/
            if (switchcount == 0 && dir == "asc") {
              dir = "desc";
              switching = true;
            }
          }
        }
      }
    

    const sectionNames = new Array();
    function show_available_seats() {
        const data = {
            venue: location.state.venue,
            show: location.state.show,
            time: new Date(location.state.time),
        };
        //make request
        // const seatList = document.getElementById("seats-list") as HTMLSelectElement;
        const seatList = document.getElementById("seats-list") as HTMLTableElement;
        seatList.innerHTML = "";
        const headerRow = seatList.createTHead().insertRow();
        headerRow.insertCell().textContent = "Select to Purchase";
        
        const sortBySection = document.createElement('button');
        sortBySection.id = 'sortSection';
        sortBySection.innerHTML = 'Section';
        sortBySection.onclick = function() {sortTable(1)}
        headerRow.insertCell().appendChild(sortBySection);
        
        const sortByRow = document.createElement('button');
        sortByRow.id = 'sortRow';
        sortByRow.innerHTML = 'Row';
        sortByRow.onclick = function() {sortTable(2)}
        headerRow.insertCell().appendChild(sortByRow);
        
        const sortByColumn = document.createElement('button');
        sortByColumn.id = 'sortCol';
        sortByColumn.innerHTML = 'Column';
        sortByColumn.onclick = function() {sortTable(3)}
        headerRow.insertCell().appendChild(sortByColumn);
        
        const sortByPrice = document.createElement('button');
        sortByPrice.id = 'sortPrice';
        sortByPrice.innerHTML = 'Price';
        sortByPrice.onclick = function() {sortTable(4)}
        headerRow.insertCell().appendChild(sortByPrice);
        
        let i = 0;
        instance.post("/get-available-seats", data).then((response) => {
            for (const section of response.data) {
                // const optionSection = document.createElement("OPTGROUP") as HTMLOptGroupElement;
                sectionNames.push([section.name, i]);
                for (const seat of section.seats) {
                    const newRow = seatList.insertRow();
                    if(seat.purchased === 0){
                        const buttonCheck = document.createElement('input') as HTMLInputElement;
                        buttonCheck.type = 'checkbox';
                        buttonCheck.name = "purchased";
                        newRow.insertCell().appendChild(buttonCheck);
                    }
                    else{
                        newRow.insertCell().textContent = 'x';
                    }
                    newRow.insertCell().textContent = section.name;
                    newRow.insertCell().textContent = rowToAlpha(seat.row);
                    newRow.insertCell().textContent = adjustToCol(seat.column).toString();
                    newRow.insertCell().textContent = seat.block.price;
                    
                }
                // console.log(optionSection);
                // seatList.add(optionSection);
                console.log(seatList)
                i += 1;
            }
        });
    }

        const rowToAlpha = (row : number) => {
            const defaultNum = 65;
            return String.fromCharCode(row+defaultNum);
        }

        const alphaToRow = (alpha : string) => {
            const defaultNum = 65;
            return (alpha.charCodeAt(0) - defaultNum);
        }

        const adjustToCol = (col : number) => {   
            return col+1;
        }

        const adjustFromCol = (col : number) => {   
            return col-1;
        }

    function purchase_seats() {
        const selectedSeats = (document.getElementsByName('purchased') as NodeListOf<HTMLInputElement>) ;
        console.log(selectedSeats);

        const seats = new Array();

        for(const node of selectedSeats){
            if(node.checked){
                const selectedRow = (node.parentNode?.parentNode as HTMLTableRowElement).cells as HTMLCollectionOf<HTMLTableCellElement>;
                const seatSect = selectedRow.item(1)?.textContent;
                const seatRow = alphaToRow(selectedRow.item(2)?.textContent as string)
                const seatCol = adjustFromCol(Number(selectedRow.item(3)?.textContent))
                
                console.log(sectionNames.filter((k) => k[0] == seatSect)[0][1]);
                const sectNum = sectionNames.filter((k) => k[0] == seatSect)[0][1];
                seats.push({ section: sectNum, row: seatRow, column: seatCol });


            }
        }
        // console.log(selectedSeats)
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
        }).catch((error)=>{const errorMessage = document.getElementById("error-message") as HTMLDivElement;
        if (Object.prototype.hasOwnProperty.call(error, "response")) {
            errorMessage.innerHTML = error.response.data;
        } else {
            errorMessage.innerHTML = error;
        }
        console.log(error);});
    }

        useEffect(() => {
           show_available_seats();
           //TODO: set "await" such that following code runs after listVenues()
       }, []);

    return (
        <>
            <div>
                <h1>Buy Tickets:</h1>
            </div>
            <div id="error-message" className="error-message"></div>
            <button onClick={() => show_available_seats()}>Refresh Seats</button>
            <div className="seats">
                <p>
                <div className="tableSeats">
                    <table className="availableSeats" id="seats-list" />
                    </div>
                </p>
                <button className="purchaseSeatButton" onClick={() => purchase_seats()}>
                    Purchase Seat
                </button>
            </div>
        </>
    );
}
