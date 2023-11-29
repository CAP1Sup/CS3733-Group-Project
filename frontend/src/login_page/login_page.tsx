import { useState } from 'react'
import reactLogo from '../src/assets/react.svg'
import viteLogo from '../src/vite.svg'
import '../App.css'
import { defineConfig } from 'vite';

function login_page() {
  const [count, setCount] = useState(0)

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
  }


    function createShow(): import("react").FormEventHandler<HTMLFormElement> | undefined {
        //TODO: pass info to backend about the show

        //if failure, return error

        //if success, change pages to venue view page
        throw new Error('Function not implemented.');
    }

    function createVenue(): import("react").FormEventHandler<HTMLFormElement> | undefined {
        //TODO: pass info from form to backend about the venue

        //if failure, return error

        //if success, change pages to venue view page
        throw new Error('Function not implemented.');
    }

    function deleteVenue(): import("react").FormEventHandler<HTMLFormElement> | undefined {
        //TODO: pass info from form to backend about deleting venue

        //if failure, return error

        //if success, refreshes display

        throw new Error('Function not implemented.');
    }

  return (
    <>
      <div>
        <h1>Login Page!</h1>
        <button onClick={(e) => console.log("hello")}>I am a consumer</button>
      </div>
      <form onSubmit="verifyUser()">
        <p>
          Username: <input type="text" name="Username" id="Username" required/>
        </p>
        <p>
          Password: <input type="password" name="pwd" id="pwd" required/>
        </p>
        <input type="submit" value="Log in" />
      </form>
      <p className="read-the-docs">
        TODO: implement verifyUser, viewShow.
      </p>

      <hr></hr>

      <div>
        <h1>Venue View!</h1>
      </div>
      <div className="venues">
        <p><button>Create Venue</button></p>
        <form onSubmit='deleteVenue()'>
        <p><select name='Venue to be deleted' id="delete-venue-list">
          <option>Venue 1</option>
          <option>Venue 2</option>
          <option>Venue 3</option>
        </select></p>
        <input type='submit' value='Delete Venue'/>
        </form>
    	</div>
        <div className="vm-shows">
          <div className="createShows">
            Create Show:
            <p><select name='Create Show' id="create-show-venue-list">
              <option>Venue 1</option>
              <option>Venue 2</option>
              <option>Venue 3</option>
            </select></p>
            <button name="create-show">Create Show</button>
          </div>
          <div className="activateShows">
            Activate Show:
            <p><select name='Activate Show' id="activate-show-list">
              <option>Show 1</option>
              <option>Show 2</option>
              <option>Show 3</option>
            </select></p>
            <button name="activate-show">Activate Show</button>
          </div>
          <div className="deleteShows">
            Delete Show:
            <p><select name='Delete Show' id="delete-show-list">
              <option>Show 1</option>
              <option>Show 2</option>
              <option>Show 3</option>
            </select></p>
            <button name="delete-show">Delete Show</button>
          </div>
          <div className="editShows">
            Edit Show:
            <p><select name='Edit Show' id="edit-show-list">
              <option>Show 1</option>
              <option>Show 2</option>
              <option>Show 3</option>
            </select></p>
            <button name="edit-show">Edit Show</button>
          </div>

        </div>

      <hr></hr>

      <div>
        <h1>Create Venue</h1>
        <form onsubmit="createVenue()">
          <p>
            Venue Name: <input type="text" name="Venuename" id="Venuename" required/>
          </p>
          <h2>Sections</h2>
          <h3>Left</h3>
            Section Name: <input type="text" name="LeftSect" id="LeftSect" required/>
            Left Rows: <input type="number" name="LeftR" id="LeftR" required/>
            Left Columns: <input type="number" name="LeftC" id="LeftC" required/>
          <h3>Center</h3>
            Section Name: <input type="text" name="CenterSect" id="CenterSect" required/>
            Center Rows: <input type="number" name="CenterR" id="CenterR" required/>
            Center Columns: <input type="number" name="CenterC" id="CenterC" required/>
          <h3>Right</h3>
            Section Name: <input type="text" name="RightSect" id="RightSect" required/>
            Right Rows: <input type="number" name="RightR" id="RightR" required/>
            Right Columns: <input type="number" name="RightC" id="RightC" required/>
          <p></p>
          <input type="submit" value="Create Venue"/>
        </form>
      </div>

      <hr></hr>

      <div>

        <h1>Create Show</h1>
            <form onsubmit="createShow()">
                Date:
                <input type='date'/>
                Time:
                <input type='time'/>
                Default Price:
                <input type='text'/>
                Name:
                <input type='text'/>
                {/* <input type='file' value='Image'/> */}
                {/* TODO: this button should pass an image back to the  */}
                <input type='submit' value='Create Show' />
            </form>
            
        </div>

    </>
  )
}

export default login_page
