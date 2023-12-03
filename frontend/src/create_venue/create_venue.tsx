import {instance, getInput} from '../main'
import { getPassword, getUsername } from '../useLogin';

export default function CreateVenue(){
    
    function createVenue() {

        // Retrieve values from elements
        const email = getUsername();
        const password = getPassword();
        //const password = createHash('sha256').update((document.getElementById("pwd") as HTMLInputElement).value).digest('hex')
        const venueName = getInput("create-venue-name");
        const leftSect = getInput("LeftSect");
        const leftR = getInput("LeftR");
        const leftC = getInput("LeftC");
        const centerSect = getInput("CenterSect");
        const centerR = getInput("CenterR");
        const centerC = getInput("CenterC");
        const rightSect = getInput("RightSect");
        const rightR = getInput("RightR");
        const rightC = getInput("RightC");
        console.log(venueName)
        const data = {
          "email": email,
          "passwd": password,
          "name": venueName,
          "sections": [
            {
              "name": leftSect,
              "columns": leftC,
              "rows": leftR
            },
            {
              "name": centerSect,
              "columns": centerC,
              "rows": centerR
            },
            {
              "name": rightSect,
              "columns": rightC,
              "rows": rightR
            }
    
    
          ]
        }
    
        instance.post("/create-venue", data).then((response) => {
          console.log(response);
        }).catch((error) => {
          console.log(error);
        });
        //Construct JSON string from elements
    
        //Make request and retrieve remaining info
    
        //if failure, return error
    
        //if success, change pages to venue view page
      }

    return (
        <>
            <div>
                <h1>Create Venue</h1>
                <p>
                Venue Name: <input type="text" name="Create Venue Name" id="create-venue-name" required />
                </p>
                <h2>Sections</h2>
                <h3>Left</h3>
                Section Name: <input type="text" name="LeftSect" id="LeftSect" required />
                Left Rows: <input type="number" min='1' name="LeftR" id="LeftR" required />
                Left Columns: <input type="number" min='1' name="LeftC" id="LeftC" required />
                <h3>Center</h3>
                Section Name: <input type="text" name="CenterSect" id="CenterSect" required />
                Center Rows: <input type="number" min='1' name="CenterR" id="CenterR" required />
                Center Columns: <input type="number" min='1' name="CenterC" id="CenterC" required />
                <h3>Right</h3>
                Section Name: <input type="text" name="RightSect" id="RightSect" required />
                Right Rows: <input type="number" min='1' name="RightR" id="RightR" required />
                Right Columns: <input type="number" min='1' name="RightC" id="RightC" required />
                <p></p>
                <button onClick={() => createVenue()}>Create Venue</button>
            </div>
        
        </>
    )
}