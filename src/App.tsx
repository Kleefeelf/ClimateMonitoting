import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Register from './Register';

import ProfilePage from './ProfilePage';
import { useState } from 'react';
import DevicePage from './DevicePage';
import ProtectedRoute from './ProtectedRoute';


function App() {
  const [token, setToken] = useState('');
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/registration" element={<Register />} />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id/devices/:deviceId"
          element={
            <ProtectedRoute >
              <DevicePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;