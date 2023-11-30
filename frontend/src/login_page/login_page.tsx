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

function login_page() {

  const verifyUser = (event: { preventDefault: () => void }) => {
    //TODO: check that username and password exists within database, and bring to correct view depending on Venue Manager, Administrator, Consumer
    //send username and hashed password to backend

    //if success, backend responds with VM or admin, bring to corresponding page

    //if failure, throw error at user

    event.preventDefault();
    console.log("Error: user verification has not yet been implemented.")
    window.location.href = '/venue_view/venue_view.tsx' //page after successful login
  }



  const viewShow = () => {
    //TODO: send user (consumer) to the shows page
    window.location.href = ""
    console.log("User goes to the shows page (not implemented yet).")
  }

  function createShow() {
    //TODO: pass info to backend about the show
    const email = getInput("username");
    const password = getInput("pwd");
    //const password = createHash('sha256').update((document.getElementById("pwd") as HTMLInputElement).value).digest('hex')
    const showDate = getInput("show-date");
    const showTime = getInput("show-time");
    const combinedDate = new Date(showDate + "T" + showTime);
    const showPrice = parseFloat(getInput("show-default-price"));
    const showName = getInput("show-name");
    const venue = getInput("show-venue-name");

    let data = {
      "email": email,
      "passwd": password,
      "venue": venue,
      "name": showName,
      "time": combinedDate,
      "defaultPrice": showPrice
    }

    instance.post("/create-show", data).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.log(error);
    });

    //if failure, return error

    //if success, change pages to venue view page
    throw new Error('Function not implemented.');
  }

  function createVenue() {

    // Retrieve values from elements
    const email = getInput("username");
    const password = getInput("pwd");
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
    let data = {
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

  function deleteVenue() {
    //TODO: pass info from form to backend about deleting venue
    const email = getInput("username");
    const password = getInput("pwd");
    //const password = createHash('sha256').update((document.getElementById("pwd") as HTMLInputElement).value).digest('hex')
    const venueName = (document.getElementById("delete-venue-list") as HTMLSelectElement).value;

    // const email = "manager@gmail.com";
    // const password = "5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5";

    console.log(venueName);

    let data = {
      "email": email,
      "passwd": password,
      "venue": venueName
    }

    instance.post("/delete-venue", data).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.log(error);
    });

    //Construct JSON string from elements

    //Make request and retrieve remaining info

    //if failure, return error

    //if success, change pages to venue view page
  }

  function listVenues() {
    const email = getInput("username");
    const password = getInput("pwd");
    //const password = createHash('sha256').update((document.getElementById("pwd") as HTMLInputElement).value).digest('hex')

    let data = {
      "email": email,
      "passwd": password
    }
    //make request
    instance.post('/list-venues', data).then((response) => {

      console.log(response);
      //for each venue, create <option> element
      let str = ''
      for (let venue of response.data) {
        str += "<option>" + venue.name + "</option>";
      }

      const delete_list = (document.getElementById('delete-venue-list') as HTMLSelectElement)
      while (delete_list.length > 0) {
        delete_list.remove(delete_list.length - 1);
      }
      delete_list.innerHTML = str;
    })

    /*fetch('https://cz4153iq4a.execute-api.us-east-1.amazonaws.com/prod/list-venues', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "email": "admin@gmail.com",
        "passwd": "e2217d3e4e120c6a3372a1890f03e232b35ad659d71f7a62501a4ee204a3e66d",
      })}
    ).then(Response => console.log(Response))
    .catch(console.error)*/
  }




  // let data = {
  //   "email": email,
  //   "passwd": password
  // }
  // //make request
  // instance.post('/list-venues', data, (response) => {
  //   //for each venue, create <option> element
  //   let str = ''
  //   for (let v of response.venues) {
  //     str += "<option>" + v.name + "</option>";
  //   }

  //   const delete_list = (document.getElementById('delete-venue-list') as HTMLSelectElement)
  //   while (delete_list.length > 0) {
  //     delete_list.remove(delete_list.length - 1);
  //   }
  //   delete_list.innerHTML = str;

  //   //put elements into 
  // })





  function activateShow(): void {
    throw new Error('Function not implemented.');
  }

  function deleteShow(): void {
    throw new Error('Function not implemented.');
  }

  function editShow(): void {
    throw new Error('Function not implemented.');
  }

  return (
    <>
      <div>
        <h1>Login Page!</h1>
        <button onClick={() => console.log("hello")}>I am a consumer</button>
      </div>
      <form action="" id="loginForm">
        <p>
          Username: <input type="text" name="Username" id="username" required />
        </p>
        <p>
          Password: <input type="password" name="pwd" id="pwd" required />
        </p>
      </form>

      <hr></hr>

      <div>
        <h1>Venue View!</h1>
      </div>
      <button onClick={() => listVenues()}>List venues</button>
      <div className="venues">
        <p><button onClick={() => createVenue()}>Create Venue</button></p>
        
          <p><select name='Venue to be deleted' id="delete-venue-list">
            <option>Venue 1</option>
            <option>Venue 2</option>
            <option>Venue 3</option>
          </select></p>
          <button onClick={()=>deleteVenue()}>Delete Venue</button>
        
      </div>
      <div className="vm-shows">
        <div className="createShows">
          <form id="create-show">
            Create Show:
            <p><select name='Create Show' id="create-show-venue-list">
              <option>Venue 1</option>
              <option>Venue 2</option>
              <option>Venue 3</option>
            </select></p>
            <button name="create-show">Create Show</button>
          </form>
        </div>
        <div className="activateShows">
          <form id="activate-show">
            Activate Show:
            <p><select name='Activate Show' id="activate-show-list">
              <option>Show 1</option>
              <option>Show 2</option>
              <option>Show 3</option>
            </select></p>
            <button name="activate-show">Activate Show</button>
          </form>
        </div>
        <div className="deleteShows">
          <form id="delete-show">
            Delete Show:
            <p><select name='Delete Show' id="delete-show-list">
              <option>Show 1</option>
              <option>Show 2</option>
              <option>Show 3</option>
            </select></p>
            <button name="delete-show">Delete Show</button>
          </form>
        </div>
        <div className="editShows">
          <form id="edit-show">
            Edit Show:
            <p><select name='Edit Show' id="edit-show-list">
              <option>Show 1</option>
              <option>Show 2</option>
              <option>Show 3</option>
            </select></p>
          </form>
          <button name="edit-show">Edit Show</button>
        </div>

      </div>

      <hr></hr>

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

      <hr></hr>

      <div>

        <h1>Create Show</h1>
        Date:
        <input type='date' id='show-date' />
        Time:
        <input type='time' id='show-time' />
        Default Price:
        <input type='number' min='0' step='.01' id='show-default-price' />
        Show Name:
        <input type='text' id='show-name' />
        {/* <input type='file' value='Image'/> */}
        {/* TODO: this button should pass an image back to the  */}
        Venue Name:
        <input type='text' id='show-venue-name' />
        <button onClick={() => createShow()}>Create Show</button>

      </div>

    </>
  )
}

export default login_page
