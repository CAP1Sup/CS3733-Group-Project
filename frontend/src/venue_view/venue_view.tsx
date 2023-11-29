import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import '../App.css'

/**
 * This page is meant to have all of the venues. 
 * 
 */

function venue_view() {
  const [count, setCount] = useState(0)


  console.log("Venue View")

  return (
      <>
        <div>
            <h1>Venue View!</h1>
          Lots of buttons to add.
        </div>
        <div className="venues">
          <p><button>Create Venue</button></p>
          
          <p><select name='Venue to be deleted' id="delete-venue-list" size="3">
            <option>Venue 1</option>
            <option>Venue 2</option>
            <option>Venue 3</option>
          </select></p>
          <button>Delete Venue</button>
          <a href='/login_page/'>link</a>

        </div>
        <div className="shows">

        </div>
      </>
    )
}

export default venue_view
