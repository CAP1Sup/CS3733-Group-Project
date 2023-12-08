import { instance, getInput } from "../main";
import { Link } from "react-router-dom";
import { getPassword, getUsername } from "../useLogin";
import { getSelect } from "../main";

import "../App.css";
import { useEffect } from "react";

export default function AllShows() {
  var exportVenue = {venue: ""};
    var exportShow = {venue: "", show: "", time: ""};


  function listVenues() {
    
    function getItemName(object : any): string {
        return object.name;
    }
    function getShowTime(object: any): string {
        return (new Date(object.time)).toUTCString();
    }
    
    function createOptionsList(data : any, selectedItem : string, get : Function){
        let optionsArray = data.map(get);
        optionsArray = optionsArray.filter((n : string, i : number) => optionsArray.indexOf(n) === i);
        let optionString = "";
        for (const option of optionsArray) {
            optionString += "<option>" + option + "</option>";
        }
        let optionIndex = optionsArray.indexOf(selectedItem)
        return [optionString, optionIndex];
    }

    const email = getUsername();
    const password = getPassword();

    const selectedVenue = getSelect('venue-list');
    const selectedShow = getSelect('show-list');
    const selectedTime = getSelect('time-list');


    const data = {
        email: email,
        passwd: password,
    };
    //make request
    instance
        .post("/list-venues", data)
        .then((response) => {
            console.log(response);
            //for each venue, create <option> element

            // if(selectedVenue in )
            //check if a selected venue exists
            //check if a selected show exists
            //show times in menu
            //else -> refresh shows list
            //else -> refresh venues

            let venuesStr = "";
            let showsStr = "";

            const venueMenu = document.getElementById('venue-list') as HTMLSelectElement;
            const showMenu = document.getElementById('show-list') as HTMLSelectElement;
            const timeMenu = document.getElementById('time-list') as HTMLSelectElement;

            console.log("e")

            console.log(response.data);
            let [venueString, venueIndex] = createOptionsList(response.data, selectedVenue, getItemName);
            venueMenu.innerHTML = venueString;
            if (venueIndex === -1) {
                showMenu.style.display = "none";
                showMenu.innerHTML = "";
                timeMenu.style.display = "none";
                timeMenu.innerHTML = "";
                return;
            }
            
            showMenu.style.display = "inline";
            timeMenu.style.display = "inline";
            //Selected venue still exists in list, reselect and then move on

            exportVenue.venue = getSelect('venue-list');
            exportShow.venue = getSelect('venue-list');
            venueMenu.selectedIndex = venueIndex;

            let [showString, showIndex] = createOptionsList(response.data[venueIndex].shows, selectedShow, getItemName);
            console.log(showIndex)
            showMenu.innerHTML = showString;
            if (showIndex === -1) {
                timeMenu.style.display = "none";
                timeMenu.innerHTML = "";
                return;
            }
            timeMenu.style.display = "inline";
            showMenu.selectedIndex = showIndex;
            exportShow.show = getSelect('show-list');

            let times = response.data[venueIndex].shows.filter((item : any)=>{return item.name === selectedShow;});
            console.log(times);
            let [timeString, timeIndex] = createOptionsList(times, selectedTime, getShowTime);
            timeMenu.innerHTML = timeString;
            if (timeIndex === -1){
                return;
            }
            timeMenu.selectedIndex = timeIndex;
            exportShow.time = getSelect('time-list');
            return;
        })
        .catch((error) => {
            const errorMessage = document.getElementById("error-message") as HTMLDivElement;
            if (Object.prototype.hasOwnProperty.call(error, "response")) {
                errorMessage.innerHTML = error.response.data;
            } else {
                errorMessage.innerHTML = error;
            }
            console.log(error);
        });
  }

  //This line runs listVenues() when the page first loads
  useEffect(() => {
    listVenues();
  }, []);

  function delete_show() {
    const email = getUsername();
    const password = getPassword();
    const showName = getSelect('show-list');
    const venue = getSelect('venue-list');
    const combinedDate = new Date(getSelect('time-list'));

    const data = {
      email: email,
      passwd: password,
      venue: venue,
      show: showName,
      time: combinedDate,
    };
    //make request
    instance.post("/delete-show", data).then((response) => {
      console.log(response);
      listVenues();
    });
  }

  function generate_show_report() {
    const email = getUsername();
    const password = getPassword();
    const showName = getSelect('show-list');
    const venue = getSelect('venue-list');
    const combinedDate = new Date(getSelect('time-list'));

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
        <h1>All Shows</h1>
      </div>
      <p>
                    <select name="Venues" id="venue-list" size={6} onChange={()=>listVenues()}>
                        <option>Venue 1</option>
                        <option>Venue 2</option>
                        <option>Venue 3</option>
                    </select>
                    <select name="Show" id="show-list" size={6} onChange={()=>listVenues()}>
                        <option>Show 1</option>
                        <option>Show 2</option>
                        <option>Show 3</option>
                    </select>
                    <select name="Times" id="time-list" size={6} onChange={()=>listVenues()}>
                        <option>Time 1</option>
                        <option>Time 2</option>
                        <option>Time 3</option>
                    </select>
                </p>
          <button onClick={() => delete_show()}>Delete Show</button>
            <Link to={"/show-report"} state={exportShow}><button onClick={() => generate_show_report()}>Generate Show Report</button></Link>
    </>
  );
}

