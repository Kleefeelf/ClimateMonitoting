import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

import { SERVER_URL } from './tokens/tokes';

interface Telemetry {
  value: number;
  date: string;
}


const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Показники температури і вологості',
    },
  },
};

function DevicePage() {
  const { id, deviceId } = useParams<{ id: string; deviceId: string }>();
  const [temperature, setTemperature] = useState<Telemetry[]>([]);
  const [humidity, setHumidity] = useState<Telemetry[]>([]);
  const [chartKey, setChartKey] = useState(0);
  const token = localStorage.getItem('token');

  useEffect(() => {
    console.log(token)
    if (token) {
      const fetchData = async () => {
        try {
          const tempResponse = await axios.get<Telemetry[]>(`${SERVER_URL}/temperature/${deviceId}`, { headers: { Authorization: `Bearer ${token}` } });
          setTemperature(tempResponse.data);
          const humResponse = await axios.get<Telemetry[]>(`${SERVER_URL}/humidity/${deviceId}`, { headers: { Authorization: `Bearer ${token}` } });
          setHumidity(humResponse.data);
          setChartKey(prevKey => prevKey + 1);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [token, deviceId]);

  const formattedLabels = temperature.map(entry => {
    const date = new Date(entry.date);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  });

  const chartData = {
    labels: formattedLabels,
    datasets: [
      {
        label: 'Temperature',
        data: temperature.map(entry => entry.value),
        borderColor: 'red',
      },
      {
        label: 'Humidity',
        data: humidity.map(entry => entry.value),
        borderColor: 'blue',
      },
    ],
  };

  return (
    <div>
      <h2>Device {deviceId} Data</h2>
      <div style={{ width: "800px", height: "400px" }}>
        <Line key={chartKey} data={chartData} options={options} />
      </div>
    </div >
  );
}

export default DevicePage;