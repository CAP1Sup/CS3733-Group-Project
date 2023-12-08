// import '../App.css'
import { getInput } from "../main";
import PropTypes from "prop-types";
import { savePassword, saveUsername } from "../useLogin";

export default function Login() {

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        saveUsername(getInput("username"));
        savePassword(getInput("pwd"));
        window.location.href = "/venue-view";
    };

    function LogOut(){
      saveUsername('');
      savePassword('');

    }

    return (
        <>
            <div>
                <h1>Login Page!</h1>
                <button onClick={() => (window.location.href = "/active-shows")}>I am a consumer</button>
            </div>
            <form onSubmit={handleSubmit} id="loginForm">
                <label>
                    <p>Username</p>
                    <input type="text" name="Username" id="username" required />
                </label>
                <label>
                    <p>Password</p>
                    <input type="password" name="pwd" id="pwd" required />
                </label>
                <p>
                    <button type="submit">Submit</button>
                </p>
            </form>
            <div>
              <button onClick={(e) => {LogOut();window.location.href="/"}}>Log Out</button>
            </div>
        </>
    );
}

Login.proptypes = {
    setLogin: PropTypes.func.isRequired,
};
