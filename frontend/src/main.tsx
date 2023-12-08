import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import axios from "axios";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

export const instance = axios.create({
    baseURL: "https://cz4153iq4a.execute-api.us-east-1.amazonaws.com/prod",
});

export function getInput(id: string) {
    return (document.getElementById(id) as HTMLInputElement).value;
}

export function getSelect(id: string){
    return (document.getElementById(id) as HTMLSelectElement).value;
}