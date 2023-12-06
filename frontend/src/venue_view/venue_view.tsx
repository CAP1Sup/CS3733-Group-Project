//import { useState } from 'react'
import '../App.css'
import { instance, getInput } from '../main'
import { getPassword, getUsername } from '../useLogin';


/**
 * This page is meant to have all of the venues.
 *
 */

function venue_view() {
  //const [count, setCount] = useState(0)

  function listVenues() {
    const email = getUsername();
    const password = getPassword();
    //const password = createHash('sha256').update((document.getElementById("pwd") as HTMLInputElement).value).digest('hex')

    const data = {
      "email": email,
      "passwd": password
    }
    //make request
    instance.post('/list-venues', data).then((response) => {

      console.log(response);
      //for each venue, create <option> element
      let venuesStr = ''
      let showsStr = ''
      for (const venue of response.data) {
        venuesStr += "<option>" + venue.name + "</option>";
        for (const show of venue.shows) {
          showsStr += "<option>" + show.name + "</option>";
        }
      }

      const delete_list = (document.getElementById('delete-venue-list') as HTMLSelectElement)
      while (delete_list.length > 0) {
        delete_list.remove(delete_list.length - 1);
      }
      delete_list.innerHTML = venuesStr;

      const create_show_list = (document.getElementById('create-show-venue-list') as HTMLSelectElement)
      while (create_show_list.length > 0) {
        create_show_list.remove(create_show_list.length - 1);
      }
      create_show_list.innerHTML = venuesStr;

      const activate_show_list = (document.getElementById('activate-show-list') as HTMLSelectElement)
      while (activate_show_list.length > 0) {
        activate_show_list.remove(activate_show_list.length - 1);
      }
      activate_show_list.innerHTML = showsStr;

      const delete_show_list = (document.getElementById('delete-show-list') as HTMLSelectElement)
      while (delete_show_list.length > 0) {
        delete_show_list.remove(delete_show_list.length - 1);
      }
      delete_show_list.innerHTML = showsStr;

      const edit_show_list = (document.getElementById('edit-show-list') as HTMLSelectElement)
      while (edit_show_list.length > 0) {
        edit_show_list.remove(edit_show_list.length - 1);
      }
      edit_show_list.innerHTML = showsStr;
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

  function deleteVenue() {
    //TODO: pass info from form to backend about deleting venue
    const email = getUsername();
    const password = getPassword();
    //const password = createHash('sha256').update((document.getElementById("pwd") as HTMLInputElement).value).digest('hex')
    const venueName = (document.getElementById("delete-venue-list") as HTMLSelectElement).value;

    // const email = "manager@gmail.com";
    // const password = "5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5";

    console.log(venueName);

    const data = {
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

  function activate_show() {
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
    instance.post('/activate-show', data).then((response) => {

      console.log(response);
    })
  }

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

  console.log("Venue View")

  return (
    <>
      <div>
        <h1>Venue View!</h1>
      </div>
      <button onClick={() => listVenues()}>List venues</button>
      <div className="venues">
        <p><button>Create Venue</button></p>

        <p><select name='Venue to be deleted' id="delete-venue-list">
          <option>Venue 1</option>
          <option>Venue 2</option>
          <option>Venue 3</option>
        </select></p>
        <button onClick={() => deleteVenue()}>Delete Venue</button>

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
    </>
  )
}

export default venue_view
