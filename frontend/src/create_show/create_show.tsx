import {instance, getInput} from '../main'
import { getPassword, getUsername } from '../useLogin';

export default function CreateShow(){
    
    function createShow() {
        //TODO: pass info to backend about the show
        const email = getUsername();
        const password = getPassword();
        //const password = createHash('sha256').update((document.getElementById("pwd") as HTMLInputElement).value).digest('hex')
        const showDate = getInput("show-date");
        const showTime = getInput("show-time");
        const combinedDate = new Date(showDate + "T" + showTime);
        const rawShowPrice = getInput("show-default-price")
        let showPrice = 10;
        if(rawShowPrice != ""){
          showPrice = parseFloat(rawShowPrice);
        }
    
        const showName = getInput("show-name");
        const venue = getInput("show-venue-name");
    
        const data = {
          "email": email,
          "passwd": password,
          "venue": venue,
          "name": showName,
          "time": combinedDate,
          "defaultPrice": showPrice
        }
    
        instance.post("/create-show", data).then((response) => {
          console.log(response);
        }).catch((error) => {
          console.log(error);
        });
    
        //if failure, return error
    
        //if success, change pages to venue view page
    }

    return (
        <>
            <div>

                <h1>Create Show</h1>
                Date:
                <input type='date' id='show-date' />
                Time:
                <input type='time' id='show-time' />
                Default Price:
                <input type='number' min='0' step='.01' id='show-default-price' />
                Show Name:
                <input type='text' id='show-name' />
                {/* <input type='file' value='Image'/> */}
                {/* TODO: this button should pass an image back to the  */}
                Venue Name:
                <input type='text' id='show-venue-name' />
                <button onClick={() => createShow()}>Create Show</button>

            </div>
        
        </>
    )
}