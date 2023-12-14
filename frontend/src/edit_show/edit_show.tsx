import { useEffect } from "react";
import { instance, getInput } from "../main";
import { getPassword, getUsername } from "../useLogin";
import { useLocation } from "react-router-dom";

export default function EditShow() {
    const location = useLocation();

    function createShow() {
        //TODO: pass info to backend about the show
        const email = getUsername();
        const password = getPassword();
        //const password = createHash('sha256').update((document.getElementById("pwd") as HTMLInputElement).value).digest('hex')
        const showDate = getInput("show-date");
        const showTime = getInput("show-time");
        const combinedDate = new Date(showDate + "T" + showTime);
        const rawShowPrice = getInput("show-default-price");
        console.log(location);
        console.log(location.state);
        console.log(location.state.venue);
        let showPrice = 10;
        if (rawShowPrice != "") {
            showPrice = parseFloat(rawShowPrice);
        }

        const showName = getInput("show-name");
        const venue = location.state.venue;

        const data = {
            email: email,
            passwd: password,
            venue: venue,
            name: showName,
            time: combinedDate,
            defaultPrice: showPrice,
        };

        instance
            .post("/create-show", data)
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.log(error);
            });

        //if failure, return error

        //if success, change pages to venue view page
    }

    function createBlock(){
        const email = getUsername();
        const password = getPassword();
        const blockName = getInput("block-name")

        const data = {
            email: email,
            passwd: password,
            venue: location.state.venue,
            show: location.state.show,
            time: new Date(location.state.time),
            name: blockName,
            price: showPrice,
            seats: seats,
        };

        instance
            .post("/create-block", data)
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.log(error);
            });
    }
    
    function deleteBlock(){
        const email = getUsername();
        const password = getPassword();

        const data = {
            email: email,
            passwd: password,
            venue: location.state.venue,
            show: location.state.show,
            time: new Date(location.state.time),
            price: showPrice,
            seats: seats,
        };

        instance
            .post("/delete-block", data)
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.log(error);
            });

    }

    function listBlocks(){
        const email = getUsername();
        const password = getPassword();

        const data = {
            email: email,
            passwd: password,
            venue: location.state.venue,
            show: location.state.show,
            time: new Date(location.state.time),
        };

        instance
            .post("/list-blocks", data)
            .then((response) => {
                console.log(response);
                for(const section of response.data.seats){
                    console.log(section);
                }
            })
            .catch((error) => {
                console.log(error);
            });


    }
    function updateShow(){

        
        
    
    }

    useEffect(() => {
        (document.getElementById('show-date') as HTMLInputElement).placeholder = (new Date(location.state.time)).toDateString();
        (document.getElementById('show-time') as HTMLInputElement).placeholder = (new Date(location.state.time)).toTimeString();
        (document.getElementById('show-name') as HTMLInputElement).placeholder = location.state.show;
        //(document.getElementById('price') as HTMLInputElement).value = 

        //first -- 

        //add options to sections


    })

    return (
        <>
            <div>
                <h1>Edit Show:</h1>
                <table>
                    <tr></tr>
                    <tr></tr>

                </table>
                <select id="section"/>
                <select id="start-row"/>
                <select id="end-row"/>

            </div>
        </>
    );
}
