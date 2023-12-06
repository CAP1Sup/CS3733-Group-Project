import {instance, getInput} from '../main'
import { getPassword, getUsername } from '../useLogin';

//import { createHash } from 'crypto'
  // TODO: crypto not installed?
  import '../App.css'
  
  function all_shows() {
  
    function delete_show() {
        const email = getUsername();
        const password = getPassword();
        const showName = (document.getElementById("delete-show-list") as HTMLSelectElement).value;
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
        const showName = (document.getElementById("generate-show-list") as HTMLSelectElement).value;
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
        <h1>All Shows</h1>
      </div>
        <div className="deleteShows">
          <form id="delete-show">
            Delete Show:
            <p><select name='Delete Show' id="delete-show-list">
              <option>Show 1</option>
              <option>Show 2</option>
              <option>Show 3</option>
            </select></p>
            <button onClick={() => delete_show()}>Delete Show</button>
          </form>
        </div>
        <div className="generateShows">
          <form id="generate-show-report">
            Generate Show Report:
            <p><select name='Generate Show' id="generate-show-list">
              <option>Show 1</option>
              <option>Show 2</option>
              <option>Show 3</option>
            </select></p>
            <button onClick={() => generate_show_report()}>Generate Show Report</button>
          </form>
        </div>
      </>
    )
  }
  
  export default all_shows