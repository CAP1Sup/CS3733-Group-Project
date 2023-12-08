import "../App.css";
import {instance, getInput } from "../main";
import { useEffect } from "react";

export default function ActiveShows() {
    
    function search_shows() {

        const searchQuery = getInput("search");

        const data = {
          "query": searchQuery
        }
        //make request
        instance.post('/search-shows', data).then((response) => {

          console.log(response);
          const search_results = document.getElementById("search-response") as HTMLDivElement
          let results_string = "";
          for (const v of response.data){
            
            for (const s of v.shows){
                results_string += s.name + "\n";
            }
            }     
            search_results.innerHTML = results_string;
        })
      }

    function list_active_shows() {

        
        //make request
        instance.get("/list-active-shows").then((response) => {
            console.log(response);
            let showsStr = "";
            for (const venue of response.data) {
                for (const show of venue.shows) {
                    showsStr += "<option>" + show.name + "</option>";
                }
            }

            const active_show_list = document.getElementById("active-show-list") as HTMLSelectElement;
            while (active_show_list.length > 0) {
                active_show_list.remove(active_show_list.length - 1);
            }
            console.log(showsStr);
            active_show_list.innerHTML = showsStr;
        });
    }


    return (
        <>
            <div>
                <h1>Active Shows</h1>
            </div>
            <div className="activeShows">
                <select name="View Active Shows" id="active-show-list">
                <option>Show 1</option>
                <option>Show 2</option>
                <option>Show 3</option>
                </select>
                <button onClick={(e) => {e.preventDefault(); list_active_shows()}}>Active Shows</button>
         
            <a href="buy-tickets"><button>Select Seats</button></a>
            </div>
            <input id="search" type="text" />
            <button onClick={(e)=>search_shows()}>Search</button>
            
            <div id="search-response"></div>
        </>
    );
}
