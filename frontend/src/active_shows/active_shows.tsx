import "../App.css";
import { instance } from "../main";

function active_shows() {
    /*
    function search_shows() {

        const searchQuery = getInput("search");

        const data = {
          "query": searchQuery
        }
        //make request
        instance.post('/search-shows', data).then((response) => {

          console.log(response);
        })
      }*/

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
                <form id="active-show">
                    <p>
                        <select name="Active Shows" id="active-show-list">
                            <option>Show 1</option>
                            <option>Show 2</option>
                            <option>Show 3</option>
                        </select>
                    </p>
                    <button onClick={() => list_active_shows()}>Active Shows</button>
                </form>
            </div>
        </>
    );
}

export default active_shows;
