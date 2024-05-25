import React, { useState } from 'react';
import axios from 'axios';
import { SERVER_URL } from './tokens/tokes';
import { useNavigate } from 'react-router-dom';
import "./style/general.css"

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post(`${SERVER_URL}/registration`, { username, password });
      navigate('/login');
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  return (
    <form onSubmit={handleRegister} className='flex-col'>
      <h1>Register</h1>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;