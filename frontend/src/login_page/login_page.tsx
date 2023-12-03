//import { createHash } from 'crypto'
  // TODO: crypto not installed?
// import '../App.css'
import {instance, getInput} from '../main'
import PropTypes from 'prop-types';
import React, {useState} from 'react';

export default function Login({ appUsername, appPassword }) {

  const [username, setUsername] = useState();
  const [password, setPassword] = useState();

  /*
  const verifyUser = (event: { preventDefault: () => void }) => {
    //TODO: check that username and password exists within database, and bring to correct view depending on Venue Manager, Administrator, Consumer
    //send username and hashed password to backend

    //if success, backend responds with VM or admin, bring to corresponding page

    //if failure, throw error at user

    event.preventDefault();
    console.log("Error: user verification has not yet been implemented.")
    window.location.href = '/venue_view/venue_view.tsx' //page after successful login
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

  function deleteVenue() {
    //TODO: pass info from form to backend about deleting venue
    const email = getInput("username");
    const password = getInput("pwd");
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

  function listVenues() {
    const email = getInput("username");
    const password = getInput("pwd");
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
    .catch(console.error)
  }*/

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    appUsername(username);
    appPassword(password);
    window.location.href = '/venue-view';
  }

  return (
    <>
      <div>
        <h1>Login Page!</h1>
        <button onClick={(e) => window.location.href = '/active-shows'}>I am a consumer</button>
      </div>
      <form onSubmit={handleSubmit} id="loginForm">
        <label>
          <p>Username</p>
          <input type="text" name="Username" id="username" onChange={(e)=>setUsername(e.target.value)} required />
        </label>
        <label>
          <p>Password</p>
          <input type="password" name="pwd" id="pwd" onChange={(e)=>setPassword(e.target.value)}  required />
        </label>
        <p>
        <button type='submit'>Submit</button>
        </p>
      </form>
    </>
)
}

Login.proptypes = {
  setLogin: PropTypes.func.isRequired
}