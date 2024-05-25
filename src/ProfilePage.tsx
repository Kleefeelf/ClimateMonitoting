import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { SERVER_URL } from './tokens/tokes';
import "./style/profile-page.css"

interface IDevice {
  id: string;
  location: string;
}

function ProfilePage() {
  const { id } = useParams();
  const [devices, setDevices] = useState<IDevice[]>([]);
  const [newDeviceId, setNewDeviceId] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const devicesListStyle = {
    marginBottom: `${10 * devices?.length}px`,
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  };

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/profile/${id}/userDevices`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data)
        setDevices(response.data);
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };

    fetchDevices();
    console.log(devices)
  }, [id, token]);

  const handleAddDevice = async () => {
    try {
      const deviceResponse = await axios.get(`${SERVER_URL}/profile/${id}/userDevices/${newDeviceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const device = deviceResponse.data;
      console.log(device.user_id, id)
      if (!device || device.user_id != id) {
        console.error('Error: Device not found or not assigned to the user');
        return;
      }

      if (devices && devices.some(dev => dev.id === device.id)) {
        console.error('Error: Device is already added');
        return;
      }

      setDevices(prevDevices => {
        if (!prevDevices) {
          return [device];
        }
        return [...prevDevices, device];
      });
      setNewDeviceId('');
    } catch (error) {
      console.error('Error fetching device:', error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div>
      <h2>User Profile</h2>
      <h3>Devices:</h3>
      <ul style={devicesListStyle}>
        {devices ? (
          devices.map(device => (
            <Link to={`/profile/${id}/devices/${device.id}`} key={device.id} className='devices-item'>
              {"Device" + device.id}
            </Link>
          ))
        ) : (
          <div>No Devices Found</div>
        )}
      </ul>
      <input type="text" placeholder="Device id" value={newDeviceId} onChange={(e) => setNewDeviceId(e.target.value)} />
      <button onClick={() => handleAddDevice()}>Add Device</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default ProfilePage