import {instance, getInput} from '../main'
import { getPassword, getUsername } from '../useLogin';

//import { createHash } from 'crypto'
  // TODO: crypto not installed?
  import '../App.css'
  
  function all_shows() {
  
    function delete_show() {
        const email = getUsername();
        const password = getPassword();
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
     
      function generate_show_report() {
        const email = getUsername();
        const password = getPassword();
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
        instance.post('/generate-show-report', data).then((response) => {
    
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
  
  export default all_shows