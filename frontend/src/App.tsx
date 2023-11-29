import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import '../App.css'

function login_page() {
  const [count, setCount] = useState(0)

  const verifyUser = (event: { preventDefault: () => void }) => {
    //TODO: check that username and password exists within database, and bring to correct view depending on Venue Manager, Administrator, Consumer
    //if user does not exist, throw error
    event.preventDefault();
    console.log("Error: user verification has not yet been implemented.")
    window.location.href = '/venue_view.tsx'
  }

  const viewShow = () => {
    //TODO: make page link to the list shows (consumer) page
    window.location.href = ""
  }


  return (
      <>
        <div>
            <h1>Login Page!</h1>
          <button onClick={(e)=>console.log("hello")}>I am a consumer</button>
        </div>
        <form onSubmit={verifyUser}>
        <p>
          Username: <input type="text" name="Username" id="Username" required></input>
        </p>
        <p>
          Password: <input type="password" name="pwd" id="pwd" required></input>
        </p>
          <input type="submit" value="Log in"/>
        </form>
        <p className="read-the-docs">
          TODO: implement verifyUser, viewShow.
        </p>
      </>
    )
}

export default login_page
