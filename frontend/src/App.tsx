import React, {useState} from 'react';
import './App.css';
import Login from './login_page/login_page';
import VenueView from './venue_view/venue_view'
import VenueManagerMenu from './venue_manager_menu/venue_manager_menu'
import CreateShow from './create_show/create_show'
import CreateVenue from './create_venue/create_venue'
import BuyTickets from './buy_tickets/buy_tickets'
import ActiveShows from './active_shows/active_shows'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function TestingHomePage(){
    return (
        <>
        <div className='bigMan'>
            <div>
            <a href="/venue-view">VenueView</a>
            </div><div>
            <a href="/venue-manager-menu">Venue Manager Menu</a>
            </div><div>
            <a href="/active-shows">Active Shows</a>
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
    const [token, setToken] = useState();

    // if(!token) {
    //     return <Login setToken={setToken} />
    // }

    return (
        <>
        <TestingHomePage />
        <hr />
            <Router>
                <Routes>
                    <Route path="/venue-view" element={<VenueView />} />
                    <Route path="/venue-manager-menu" element = {<VenueManagerMenu />} />
                    <Route path="/active-shows" element = {<ActiveShows />} />
                    <Route path="/create-show" element = {<CreateShow />} />
                    <Route path="/create-venue" element = {<CreateVenue />} />
                    <Route path="/buy-tickets" element={<BuyTickets />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </Router>
        </>
    )
}