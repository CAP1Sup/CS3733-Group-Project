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
export default function VenueManagerMenu() {

    function activate_show() {
        const email = getInput("username");
        const password = getInput("pwd");
        //const password = createHash('sha256').update((document.getElementById("pwd") as HTMLInputElement).value).digest('hex')
        const showName = getInput("show-name");
        const venue = getInput("show-venue-name");
        const showDate = getInput("show-date");
        const showTime = getInput("show-time");
        const combinedDate = new Date(showDate + "T" + showTime);

        const data = {
          "email": email,
          "passwd": password,
          "venue": venue,
          "show": showName,
          "time": combinedDate,
        }
        //make request
        instance.post('/activate-show', data).then((response) => {
    
          console.log(response);
        })
      }

      function delete_show() {
        const email = getInput("username");
        const password = getInput("pwd");
        //const password = createHash('sha256').update((document.getElementById("pwd") as HTMLInputElement).value).digest('hex')
        const showName = getInput("show-name");
        const venue = getInput("show-venue-name");
        const showDate = getInput("show-date");
        const showTime = getInput("show-time");
        const combinedDate = new Date(showDate + "T" + showTime);

        const data = {
          "email": email,
          "passwd": password,
          "venue": venue,
          "show": showName,
          "time": combinedDate,
        }
        //make request
        instance.post('/delete-show', data).then((response) => {
    
          console.log(response);
        })
      }

      
  return (
    <>
      <div>

        <h1>Venue Manager Menu!</h1>
      </div>

    </>
  )
}