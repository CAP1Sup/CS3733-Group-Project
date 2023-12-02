//import { createHash } from 'crypto'
// TODO: crypto not installed?
import '../App.css'
import axios from 'axios'


const instance = axios.create({
    baseURL: 'https://cz4153iq4a.execute-api.us-east-1.amazonaws.com/prod',
});

function getInput(id: string) {
    return (document.getElementById(id) as HTMLInputElement).value;
}
function buy_tickets() {

    function show_avaliable_seats() {
        const showName = getInput("show-name");
        const venue = getInput("show-venue-name");
        const showDate = getInput("show-date");
        const showTime = getInput("show-time");
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
        const showName = getInput("show-name");
        const venue = getInput("show-venue-name");
        const showDate = getInput("show-date");
        const showTime = getInput("show-time");
        const combinedDate = new Date(showDate + "T" + showTime);

        const data = {
            "venue" : venue,
            "show" : showName,
            "time" : combinedDate,
            "seats" :[
                {

                }
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
    )
}

export default buy_tickets