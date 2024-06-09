import express, { Request, Response } from 'express';
import { connection, pool } from './db.ts';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import util from 'util';

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const options: cors.CorsOptions = {
  origin: '*',
};
app.use(cors(options));
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type'
  );
  next();
});
// app.options('/*', function (req, res) {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', '*');
//   res.setHeader('Access-Control-Allow-Headers', '*');
//   res.end();
// });
function generateNewDate() {
  const date = new Date();
  const currentDate =
    date.getFullYear() +
    '-' +
    date.getMonth() +
    '-' +
    date.getDay() +
    ' ' +
    date.getHours() +
    ':' +
    date.getMinutes() +
    ':' +
    date.getSeconds();
  console.log(currentDate);
  return currentDate;
}
const query = util.promisify(pool.query).bind(pool);

app.get('/', (req: Request, res: Response) => {
  console.log(req);
  res.send('Hello, TypeScript Express!');
});

app.get('/temperature/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  connection.query(
    '(SELECT * FROM temperature WHERE device_id = ? ORDER BY id DESC LIMIT 50) order by id ASC  ',
    [deviceId],
    (error, results) => {
      if (error) {
        console.error('Error fetching temperature:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(results);
      }
    }
  );
});

app.get('/humidity/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  connection.query(
    '(SELECT * FROM humidity WHERE device_id = ? ORDER BY id DESC LIMIT 50) order by id ASC ',
    [deviceId],
    (error, results) => {
      if (error) {
        console.error('Error fetching humidity:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(results);
      }
    }
  );
});

app.post('/temperature', (req, res) => {
  const { device_id, value } = req.body;
  const date = generateNewDate();
  connection.query(
    'INSERT INTO temperature (device_id, date, value) VALUES (?, ?, ?)',
    [device_id, date, value],
    (error, result) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        console.log('Query result:', result);
        res.json(result);
      }
    }
  );
});

app.post('/humidity', (req, res) => {
  const { device_id, value } = req.body;
  const date = generateNewDate();
  connection.query(
    'INSERT INTO humidity (device_id, date, value) VALUES (?, ?, ?)',
    [device_id, date, value],
    (error, result) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        console.log('Query result:', result);
        res.json(result);
      }
    }
  );
});

app.post('/registration', (req, res) => {
  const { username, password } = req.body;
  connection.query(
    'INSERT INTO `kurs`.`users`(`username`,`password`) VALUES (?, ?)',
    [username, password],
    (error, result) => {
      if (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(result);
      }
    }
  );
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required' });
  }
  connection.query(
    'SELECT `users`.`id`,`users`.`username`,`users`.`password` FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Internal server error' });
      }
      if (results.length === 0) {
        return res
          .status(401)
          .json({ message: 'Invalid username or password' });
      }

      const userId = results[0].id;

      const token = jwt.sign({ username: username }, 'your_secret_key', {
        expiresIn: '24h',
      });

      return res.status(200).json({
        message: 'Login successful',
        token: token,
        id: userId,
      });
    }
  );
});

app.get('/devices/:deviceId/data', async (req, res) => {
  const { deviceId } = req.params;

  try {
    const temperatureData = await connection.query(
      'SELECT * FROM temperature WHERE device_id = ?',
      [deviceId]
    );
    const humidityData = await connection.query(
      'SELECT * FROM humidity WHERE device_id = ?',
      [deviceId]
    );

    res.json({ temperature: temperatureData, humidity: humidityData });
  } catch (error) {
    console.error('Error fetching device data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/devices', async (req, res) => {
  const { user_id, device_name } = req.body;
  if (!user_id || !device_name) {
    return res
      .status(400)
      .json({ error: 'User ID and device name are required' });
  }
  try {
    const result = await connection.query(
      'INSERT INTO devices (user_id, device_name) VALUES (?, ?)',
      [user_id, device_name]
    );

    res.status(200).json({ message: 'Device added successfully' });
  } catch (error) {
    console.error('Error adding new device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/profile/:id/userDevices', async (req, res) => {
  const userId = req.params.id;
  try {
    const devices = await query(
      'SELECT `id`,`user_id`,`device_location` FROM devices WHERE user_id = ?',
      [userId]
    );
    res.json(devices);
  } catch (error) {
    console.error('Error fetching user devices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/profile/:id/userDevices/:deviceId', async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const userId = req.params.id;
    connection.query(
      'SELECT * FROM devices WHERE id = ? AND user_id = ?',
      [deviceId, userId],
      (error, results) => {
        if (error) {
          console.error('Error fetching device:', error);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length === 0) {
          return res
            .status(404)
            .json({ error: 'Device not found for the user' });
        }

        const device = results[0];
        res.json(device);
      }
    );
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, '192.168.0.187', () => {
  connection.connect();
  console.log(`Server running at http://192.168.0.187:${port}`);
});
