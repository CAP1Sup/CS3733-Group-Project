import { useState } from 'react';

export const getUsername = () => {
  const usernameString = sessionStorage.getItem('username');
  const username = JSON.parse(usernameString);
  return username;
};

export const getPassword = () => {
  const passwordString = sessionStorage.getItem('password');
  const password = JSON.parse(passwordString);
  return password;
};

export default function useLogin() {

  const [username, setUsername] = useState(getUsername());
  const [password, setPassword] = useState(getPassword());

  const saveUsername = username => {
    sessionStorage.setItem('username', JSON.stringify(username));
    setUsername(username.username);
  };

  const savePassword = password => {
    sessionStorage.setItem('password', JSON.stringify(password));
    setPassword(password.password);
  };

  return {
    setUsername: saveUsername,
    username: username,
    setPassword: savePassword,
    password: password
  }
}