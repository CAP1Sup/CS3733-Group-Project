import { useState } from 'react';

export const getUsername = () => {
  const usernameString = sessionStorage.getItem('username');
  if (usernameString == null){
    return null;
  }
  const username = JSON.parse(usernameString);
  return username;
};

export const getPassword = () => {
  const passwordString = sessionStorage.getItem('password');
  if (passwordString == null){
    return null;
  }
  const password = JSON.parse(passwordString);
  return password;
};

export default function useLogin() {

  const [username, setUsername] = useState(getUsername());
  const [password, setPassword] = useState(getPassword());

  const saveUsername = (username: { username: any; }) => {
    sessionStorage.setItem('username', JSON.stringify(username));
    setUsername(username.username);
  };

  const savePassword = (password: { password: any; }) => {
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