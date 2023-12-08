import { instance } from "../main";
import { getPassword, getUsername } from "../useLogin";
import { useLocation } from "react-router-dom";

import "../App.css";

export default function ShowReport() {
    const location = useLocation();

    //This line runs generate_show_report() when the page first loads

    console.log(location.state.venue + "/" + location.state.show + "/" + location.state.time + " c'est la venue");

    function generate_show_report() {
        const email = getUsername();
        const password = getPassword();
        const venueName = location.state.venue;
        // const showName = location.state.show;
        // const combinedDate = new Date(location.state.time);

        const data = {
            email: email,
            passwd: password
        };
        //make request
        instance.post("/list-venues", data).then((response) => {

            console.log(response);
            const showsArray = response.data.filter((obj: any)=>obj.name===venueName)[0];
            const sReport = document.getElementById('shows-report') as HTMLDivElement;
            sReport.innerHTML = "<tr><th>Venue Name</th><th>Show Name</th><th>Active?</th></tr>";
            console.log(showsArray);
            for(const show of showsArray.shows){
                let active = "Active";
                if(show.active === 0){
                    active = "Inactive"
                }
                sReport.innerHTML +="<tr><th>" + venueName + "</th><th>" + show.name + "</th><th>" + active + "</th></tr>";
            }
            return response;
        }).catch((error)=>{
            console.log(error);
            return error;
        });
    }

    

    return (
        <>
            <div>
                <h1>Show Report</h1>
            </div>
            
            <button onClick={() => generate_show_report()}>Show Report</button>
            <label>Venue: {location.state.venue} </label>
            <table id="shows-report"></table>
        </>
    );
}
