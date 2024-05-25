import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import "./style/general.css"

import { SERVER_URL } from './tokens/tokes';

interface LoginProps {
  setToken: (token: string) => void;
}

const Login: React.FC<LoginProps> = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const nagivate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${SERVER_URL}/login`, { username, password });
      console.log('Login successful:', response.data);
      console.log(response.data)
      const id = response.data.id;
      localStorage.setItem('token', response.data.token);
      nagivate(`/profile/${id}`)
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h1>Login</h1>
      <div className='flex-col'>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <Link to="/registration">Create an account</Link>
      </div>
      <button type="submit">Login</button>
    </form>
  );
};

export default Login