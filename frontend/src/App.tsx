
import './App.css';
import Login from './login_page/login_page';
import VenueView from './venue_view/venue_view'
import CreateShow from './create_show/create_show'
import CreateVenue from './create_venue/create_venue'
import BuyTickets from './buy_tickets/buy_tickets'
import AllShows from './all_shows/all_shows'
import ActiveShows from './active_shows/active_shows'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import useLogin from './useLogin';

function TestingHomePage(){
    return (
        <>
        <div className='bigMan'>
            <div>
            <a href="/active-shows">Active Shows</a>
            </div><div>
            <a href='/all-shows'>All Shows</a>
            </div><div>
            <a href="/venue-view">VenueView</a>
            </div><div>
            <a href="/create-show">Create Show</a>
            </div><div>
            <a href="/create-venue">Create Venue</a>
            </div><div>
            <a href="/buy-tickets">Buy Tickets</a>
            </div><div>
            <a href="/login">Login</a>
            </div>
        </div>
    </>
    )
}

export default function App(){
    const {username, setUsername, password, setPassword} = useLogin();

    if(!username || !password){
        return (
        <><Login appUsername={setUsername} appPassword={setPassword} /></>)
    }

    return (
        <>
        <TestingHomePage />
        <hr />
            <Router>
                <Routes>
                    <Route path="/venue-view" element={<VenueView />} />
                    <Route path="/buy-tickets" element={<BuyTickets />} />
                    <Route path="/all-shows" element={<AllShows />} />
                    <Route path="/active-shows" element = {<ActiveShows />} />
                    <Route path="/create-show" element = {<CreateShow />} />
                    <Route path="/create-venue" element = {<CreateVenue />} />
                    <Route path="/buy-tickets" element={<BuyTickets />} />
                    <Route path="/login" element={<Login appUsername={setUsername} appPassword={setPassword} />} />
                </Routes>
            </Router>
        </>
    )
}