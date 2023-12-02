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
function active_shows() {

    function search_shows() {
        
        const searchQuery = getInput("search");

        const data = {
          "query": searchQuery
        }
        //make request
        instance.post('/search-shows', data).then((response) => {
    
          console.log(response);
        })
      }

      function list_active_shows() {
        
        //make request
        instance.get('/list-active-shows').then((response) => {
    
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

export default active_shows