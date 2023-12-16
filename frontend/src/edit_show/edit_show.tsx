import { useEffect } from "react";
import { instance, getInput, getSelect } from "../main";
import { getPassword, getUsername } from "../useLogin";
import { Link, useLocation } from "react-router-dom";

export default function EditShow() {
    const location = useLocation();
    if(location.state == null || location.state.venue == "" || location.state.show == "" || location.state.time == ""){
        return (
            <>
                <h1>Error: you shouldn't be here. Please select a venue, show and time from <Link to='/venue-view'>here</Link> to navigate here properly.</h1>
            </>
        )
    }
    let sectionInfos = new Array();


    function createBlock(){
        const email = getUsername();
        const password = getPassword();
        const blockName = getInput("block-name")
        const blockPrice = getInput("block-price")
        const sectionName = getSelect("section")
        const startRow = getInput("start-row")
        const endRow = getInput("end-row")
        
        const errorMessage = document.getElementById("error-message") as HTMLDivElement;
        if (startRow.length != 1 || startRow.length != 1 || !/^[A-Z]/.test(startRow) || !/^[A-Z]/.test(endRow)){
            errorMessage.innerHTML = 'Error: inputted row and column must be single letters ranging from A-Z. (caps sensitive)';
            return;
        }
        else if(alphaToRow(startRow) > alphaToRow(endRow)){
            errorMessage.innerHTML = 'Error: inputted end row comes earlier than the inputted starting row.';
        }
        else if(blockName === 'Default'){
            errorMessage.innerHTML = 'Error: Default is a reserved keyword for block names. Please choose a different block name.';
        }
        else if(sectionName === ''){
            errorMessage.innerHTML = 'Error: Please select a section name.';
        }
        errorMessage.innerHTML = '';

        const seats = new Array();
        const selectedSectionInfo = sectionInfos.filter((value)=>{return value.name === sectionName})[0]; //TODO
        for (let i = alphaToRow(startRow); i <= alphaToRow(endRow); i++){
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
                listBlocks();
            })
            .catch((error) => {
                
                const errorMessage = document.getElementById("error-message") as HTMLDivElement;
                if (Object.prototype.hasOwnProperty.call(error, "response")) {
                    errorMessage.innerHTML = error.response.data;
                } else {
                    errorMessage.innerHTML = error;
                }
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
                listBlocks();
            })
            .catch((error) => {
                
                const errorMessage = document.getElementById("error-message") as HTMLDivElement;
                if (Object.prototype.hasOwnProperty.call(error, "response")) {
                    errorMessage.innerHTML = error.response.data;
                } else {
                    errorMessage.innerHTML = error;
                }
                console.log(error);
            });

    }

    const rowToAlpha = (row : number) => {
        const defaultNum = 65;
        return String.fromCharCode(row+defaultNum);
    }

    const alphaToRow = (alpha : string) => {
        const defaultNum = 65;
        return (alpha.charCodeAt(0) - defaultNum);
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
                                    "endrow":seat.row,
                                "totalseats":1,
                            "purchasedseats":seat.purchased});
                            }
                            else{
                                const index = uniqueBlockNames.reduce((arr, e, i) => ((e.blockname === seat.block.name) && arr.push(i), arr), []);
                                uniqueBlockNames[index] = {...uniqueBlockNames[index], "totalseats":uniqueBlockNames[index].totalseats+1, "purchasedseats":uniqueBlockNames[index].purchasedseats + seat.purchased, "endrow":seat.row};
                            }
                        // }
                    }
                }
                console.log(sectionInfos)
                console.log(uniqueBlockNames);
                const table = document.getElementById('block-listings') as HTMLTableElement;
                table.innerHTML = "";
                const headerRow = table.insertRow();
                headerRow.insertCell().textContent = "Block Name";
                headerRow.insertCell().textContent = "Price"
                headerRow.insertCell().textContent = "Section"
                headerRow.insertCell().textContent = "Starting Row"
                headerRow.insertCell().textContent = "Ending Row"
                headerRow.insertCell().textContent = "Seats Purchased"
                // headerRow.insertCell().textContent = "Seats Purchased"
                for(const item of uniqueBlockNames){
                    const tempRow = table.insertRow();
                    tempRow.insertCell().textContent = item.blockname;
                    tempRow.insertCell().textContent = item.price;
                    tempRow.insertCell().textContent = item.section;
                    tempRow.insertCell().textContent = rowToAlpha(item.startrow);
                    tempRow.insertCell().textContent = rowToAlpha(item.endrow);
                    tempRow.insertCell().textContent = item.purchasedseats.toString() + "/" + item.totalseats.toString();
                }
            })
            .catch((error) => {
                const errorMessage = document.getElementById("error-message") as HTMLDivElement;
                if (Object.prototype.hasOwnProperty.call(error, "response")) {
                    errorMessage.innerHTML = error.response.data;
                } else {
                    errorMessage.innerHTML = error;
                }
                console.log(error);
            });


    }
    useEffect( () => {
        listBlocks();
    }, []);

    return (
        <>
            <div>
                <Link to='/venue-view'><button>Back</button></Link>
                <div id="error-message" className="error-message"></div>
                <h1>Edit Show:</h1>
                <select id="section"/>
                <input type="text" placeholder="Starting row..." id="start-row"/>
                <input type="text" placeholder="Ending row..." id="end-row"/>
                
                Block Name:
                <input className="blockName" type="text" id="block-name" />

                Block Price:
                <input className="blockPrice" type="number" min="0" step=".01" id="block-price"/>

                <button className="createBlockButton" onClick={() => createBlock()}>
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
