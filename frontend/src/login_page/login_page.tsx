import { getInput } from "../main";
import PropTypes from "prop-types";
import { savePassword, saveUsername } from "../useLogin";
import "./login_page.css";

export default function Login() {
    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        saveUsername(getInput("username"));
        savePassword(getInput("pwd"));
        window.location.href = "/venue-view";
    };

    function LogOut() {
        saveUsername("");
        savePassword("");
    }

    return (
        <>
            <h1 className="header">BigTicket Login:</h1>
            <div>
                <button className="consumerButton" onClick={() => (window.location.href = "/active-shows")}>
                    I am a consumer
                </button>
            </div>
            <form onSubmit={handleSubmit} id="loginForm">
                <label>
                    <p></p>
                    <input type="text" name="Username" id="username" placeholder="Username" required />
                </label>
                <label>
                    <p></p>
                    <input type="password" name="pwd" id="pwd" placeholder="Password" required />
                </label>
                <p>
                    <button className="loginButton" type="submit">
                        Login
                    </button>
                </p>
            </form>
            <div>
                <button
                    className="logoutButton"
                    onClick={(e) => {
                        LogOut();
                        window.location.href = "/";
                    }}
                >
                    Log Out
                </button>
            </div>
        </>
    );
}

Login.proptypes = {
    setLogin: PropTypes.func.isRequired,
};
