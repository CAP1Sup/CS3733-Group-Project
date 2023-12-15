import { useEffect } from "react";
import { instance, getInput, getSelect } from "../main";
import { getPassword, getUsername } from "../useLogin";
import { useLocation } from "react-router-dom";

export default function EditShow() {
    const location = useLocation();
    let sectionInfos = new Array();

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
        const blockPrice = getInput("block-price")
        const sectionName = getSelect("section")
        const startRow = Number(getInput("start-row"))
        const endRow = Number(getInput("end-row"))
        const seats = new Array();
        const selectedSectionInfo = sectionInfos.filter((value)=>{return value.name === sectionName})[0]; //TODO
        for (let i = startRow; i <= endRow; i++){
            for (let j = 0; j < selectedSectionInfo.cols; j++){
                seats.push({"section":selectedSectionInfo.index, "row":i, "column":j});
            }
        }

        const data = {
            email: email,
            passwd: password,
            venue: location.state.venue,
            show: location.state.show,
            time: new Date(location.state.time),
            name: blockName,
            price: blockPrice,
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
        const blockName = getInput("block-name")

        const data = {
            email: email,
            passwd: password,
            venue: location.state.venue,
            show: location.state.show,
            time: new Date(location.state.time),
            name: blockName
            
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
                const selectDropdown = document.getElementById('section') as HTMLSelectElement;
                selectDropdown.innerHTML = "";
                const uniqueBlockNames = new Array();
                let a = 0;
                for(const section of response.data){
                    if(sectionInfos.length < 3){
                        sectionInfos.push({"name" : section.name, "rows" : section.rows, "cols" : section.columns, "index" : a})
                        a += 1;
                    }
                    const nameElement = document.createElement('option') as HTMLOptionElement;
                    console.log(section);
                    nameElement.text = section.name;
                    selectDropdown.add(nameElement);
                    for(const seat of section.seats){
                        // if(){
                            // console.log(uniqueBlockNames);
                            // console.log(seat);
                            const selectedBlock = uniqueBlockNames.filter((value)=>{return value.blockname.toString() === seat.block.name.toString()})
                            if(seat.block.name == "Default"){
                                continue;
                            }
                            if(selectedBlock.length <= 0){
                                uniqueBlockNames.push({"blockname": seat.block.name,
                                    "price":seat.block.price,
                                    "section":section.name,
                                    "startrow":seat.row,
                                    "endrow":seat.row});
                            }
                            else{
                                uniqueBlockNames[uniqueBlockNames.reduce((arr, e, i) => ((e.blockname === seat.block.name) && arr.push(i), arr), [])]= {...uniqueBlockNames[uniqueBlockNames.reduce((arr, e, i) => ((e.blockname === seat.block.name) && arr.push(i), arr), [])], "endrow":seat.row};
                            }
                        // }
                    }
                }
                console.log(sectionInfos)
                console.log(uniqueBlockNames);
                const table = document.getElementById('block-listings') as HTMLTableElement;
                // for(const name in uniqueBlockNames){}
                // table.insertRow().insertCell(0);
            })
            .catch((error) => {
                console.log(error);
            });


    }
    useEffect( () => {
        // listBlocks();
    }, []);

    return (
        <>
            <div>
                <h1>Edit Show:</h1>
                <select id="section"/>
                <input type="number" placeholder="Starting row..." id="start-row"/>
                <input type="number" placeholder="Ending row..." id="end-row"/>
                
                Block Name:
                <input className="blockName" type="text" id="block-name" />

                Block Price:
                <input className="blockPrice" type="number" min="0" step=".01" id="block-price"/>

                <button className="createBloclButton" onClick={() => createBlock()}>
                    Create Block
                </button>

                <button className="deleteBlockButton" onClick={() => deleteBlock()}>
                    Delete Block
                </button>

                <button className="listBlocksButton" onClick={() => listBlocks()}>
                    List Blocks
                </button>

                <table id="block-listings"></table>
            </div>
        </>
    );
}
