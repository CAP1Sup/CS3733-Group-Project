// TODO: Maybe remove?
//import { useState } from "react";
//const [username, setUsername] = useState(getUsername());
//const [password, setPassword] = useState(getPassword());

export function getUsername() {
    const usernameString = sessionStorage.getItem("username");
    if (usernameString == null) {
        return null;
    }
    const username = JSON.parse(usernameString);
    return username;
}

export function getPassword() {
    const passwordString = sessionStorage.getItem("password");
    if (passwordString == null) {
        return null;
    }
    const password = JSON.parse(passwordString);
    return password;
}

export function saveUsername(username: string) {
    sessionStorage.setItem("username", JSON.stringify(username));
}

export function savePassword(password: string) {
    sessionStorage.setItem("password", JSON.stringify(password));
}
