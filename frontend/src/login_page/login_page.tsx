import { useState } from 'react'
import '../App.css'
import axios from 'axios'

const url = 'https://cz4153iq4a.execute-api.us-east-1.amazonaws.com/prod'


// Assume resource always starts with a "/"
function api(resource) {
  return url + resource
}

// Details on Fetch can be found here:
//
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

// 
// resource is a string like "/calc" or "/constants/delete"
export async function post(resource, data, handler) {
  fetch(api(resource), {
    method: "POST",
    //headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)   // Stringify into string for request
  })
    .then((response) => response.json())
    .then((responseJson) => handler(responseJson))
    .catch((err) => handler(err))
}


const instance = axios.create({
  baseURL: 'https://cz4153iq4a.execute-api.us-east-1.amazonaws.com/prod',
});

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
    const email = (document.getElementById("Username") as HTMLInputElement).value
    const password = (document.getElementById("pwd") as HTMLInputElement).value
    const showDate = (document.getElementById("show-date") as HTMLInputElement).value
    const showTime = (document.getElementById("show-time") as HTMLInputElement).value
    const showPrice = (document.getElementById("show-default-price") as HTMLInputElement).value
    const showName = (document.getElementById("show-name") as HTMLInputElement).value
    
    //TODO: need venue information from View Venues page
    const venue = "";

    let data={
      "email": email,
      "passwd": password,
      "venue": venue,
      "name": showName,
      "datetime": showDate + "T" + showTime,
      "defaultPrice": showPrice
    }
    console.log("createShow.")
    //instance.post()
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
    console.log("createVenue.")

    //Retrieve values from elements
    const email = (document.getElementById("Username") as HTMLInputElement).value
    const password = (document.getElementById("pwd") as HTMLInputElement).value
    const venueName = (document.getElementById("Venuename") as HTMLInputElement).value
    const leftSect = (document.getElementById("LeftSect") as HTMLInputElement).value
    const leftR = (document.getElementById("LeftR") as HTMLInputElement).value;
    const leftC = (document.getElementById("LeftC") as HTMLInputElement).value;
    const centerSect = (document.getElementById("CenterSect") as HTMLInputElement).value
    const centerR = (document.getElementById("CenterR") as HTMLInputElement).value;
    const centerC = (document.getElementById("CenterC") as HTMLInputElement).value;
    const rightSect = (document.getElementById("RightSect") as HTMLInputElement).value
    const rightR = (document.getElementById("RightR") as HTMLInputElement).value;
    const rightC = (document.getElementById("RightC") as HTMLInputElement).value;
    console.log(venueName)
    let data = {
      "email" : email,
      "passwd": password,
      "name": venueName,
      "sections" : [
        {
          "name" : leftSect,
          "columns" : leftC,
          "rows" : leftR
        },
        {
          "name" : centerSect,
          "columns" : centerC,
          "rows" : centerR
        },
        {
          "name" : rightSect,
          "columns" : rightC,
          "rows" : rightR
        }


      ]
    }

    post("/create-venue", data, (response) => {
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
    console.log("deleteVenue.")
    const email = (document.getElementById("Username") as HTMLInputElement).value
    const password = (document.getElementById("pwd") as HTMLInputElement).value
    const venueName = (document.getElementById("Venuename") as HTMLInputElement).value
    
    let data = {
      "email":email,
      "passwd":password,
      "venue":venueName
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

  function listVenues() {
    const email = (document.getElementById("Username") as HTMLInputElement).value
    const password = (document.getElementById("pwd") as HTMLInputElement).value
    
    let data = {
      "email" : email,
      "passwd": password
    }
    //make request
    instance.post('/list-venues', data, (response) => {
      //for each venue, create <option> element
      let str=''
      for (let v of response.venues){
        str += "<option>" + v.name + "</option>";
      }

      const delete_list = (document.getElementById('delete-venue-list') as HTMLSelectElement)
      while(delete_list.length > 0){
        delete_list.remove(delete_list.length - 1);
      }
      delete_list.innerHTML = str;
      
      //put elements into 
    })
    
    
    
  }

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
        <button onClick={(e) => console.log("hello")}>I am a consumer</button>
      </div>
      <form action="" id="loginForm">
        <p>
          Username: <input type="text" name="Username" id="Username" required />
        </p>
        <p>
          Password: <input type="password" name="pwd" id="pwd" required />
        </p>
        <input type="submit" value="Log in" />
      </form>

      <hr></hr>

      <div>
        <h1>Venue View!</h1>
      </div>
      <button onClick={(e)=>listVenues()}>list venue</button>
      <div className="venues">
        <p><button onClick={(e) => createVenue()}>Create Venue</button></p>
        <form id="delete-venue">
          <p><select name='Venue to be deleted' id="delete-venue-list">
            <option>Venue 1</option>
            <option>Venue 2</option>
            <option>Venue 3</option>
          </select></p>
          <input type='submit' value='Delete Venue' />
        </form>
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
          Venue Name: <input type="text" name="Venuename" id="Venuename" required />
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
          <input type='time' id='show-time'/>
          Default Price:
          <input type='number' min='0' step='.01' id='show-default-price'/>
          Name:
          <input type='text' id='show-name'/>
          {/* <input type='file' value='Image'/> */}
          {/* TODO: this button should pass an image back to the  */}
          <button onClick={(e)=>createShow()}>Create Show</button>

      </div>

    </>
  )
}

export default login_page
