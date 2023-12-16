import { Link } from "react-router-dom";
import { instance, getInput } from "../main";
import { getPassword, getUsername } from "../useLogin";
import "./create_venue.css";

export default function CreateVenue() {
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
        console.log(venueName);
        const data = {
            email: email,
            passwd: password,
            name: venueName,
            sections: [
                {
                    name: leftSect,
                    columns: leftC,
                    rows: leftR,
                },
                {
                    name: centerSect,
                    columns: centerC,
                    rows: centerR,
                },
                {
                    name: rightSect,
                    columns: rightC,
                    rows: rightR,
                },
            ],
        };

        instance
            .post("/create-venue", data)
            .then((response) => {
                console.log(response);
                window.location.href = "/venue-view";
            })
            .catch((error) => {
                const errorMessage = document.getElementById("error-message") as HTMLDivElement;
                errorMessage.innerHTML = error;
                console.log(error);
            });
    }

    return (
        <>
            <div>
                <Link to='/venue-view'><button>Back</button></Link>
                <div id="error-message" className="error-message"></div>
                <h1>Create Venue</h1>
                <div id="error-message" className="error-message"></div>
                <p>
                    Venue Name: <input type="text" name="Create Venue Name" id="create-venue-name" required />
                </p>
                <h2>Sections:</h2>
                <h3></h3>
                Section Name: <input type="text" name="LeftSect" id="LeftSect" required />
                Section Name: <input type="text" name="CenterSect" id="CenterSect" required />
                Section Name: <input type="text" name="RightSect" id="RightSect" required />
                <h3></h3>
                Left Rows: <input type="number" min="1" name="LeftR" id="LeftR" required />
                Center Rows: <input type="number" min="1" name="CenterR" id="CenterR" required />
                Right Rows: <input type="number" min="1" name="RightR" id="RightR" required />
                <h3></h3>
                Left Columns: <input type="number" min="1" name="LeftC" id="LeftC" required />
                Center Columns: <input type="number" min="1" name="CenterC" id="CenterC" required />
                Right Columns: <input type="number" min="1" name="RightC" id="RightC" required />
                <p></p>
                <button className="createVenueButton" onClick={() => createVenue()}>
                    Create Venue
                </button>
            </div>
        </>
    );
}
