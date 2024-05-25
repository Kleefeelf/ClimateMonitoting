import express, { urlencoded, json } from 'express';
import { connect, query } from './db';
import cors from 'cors';

const app = express();
const port = 3000;

connect();

app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello, TypeScript Express!');
});

app.get('/temperature', (req, res) => {
  query(
    'select * from ( select DATE_FORMAT(temperature.date, "%d.%m %H:%i") as date, value from temperature order by id desc limit 5 ) as temperature order by temperature.date  asc;',
    function (err, result) {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(result);
      }
    }
  );
});

app.get('/humidity', (req, res) => {
  query(
    'select * from ( select DATE_FORMAT(humidity.date, "%d.%m %H:%i:%s") as date, value from humidity order by id desc limit 5 ) as humidity order by humidity.date  asc;',
    function (err, result) {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(result);
      }
    }
  );
});

app.post('/temperature', (req, res) => {
  const temp = req.body.value;
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
  query(
    'INSERT INTO `kurs`.`temperature`(`date`, `value`) VALUES(?, ?);',
    [currentDate, temp],
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
  const temp = req.body.value;
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
  query(
    'INSERT INTO `kurs`.`humidity`(`date`, `value`) VALUES(?, ?);',
    [currentDate, temp],
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

app.post('/registration', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: 'Missing required fields: username and password' });
  }
  try {
    const sql = `INSERT INTO kurs.users (username, password) VALUES (?, ?)`;
    await query(sql, [username, password]); // Consider hashing password before storing
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Internal server ERROR' });
  }
});

app.listen(port, '192.168.0.187', () => {
  console.log(`Server running at http://192.168.0.187:${port}`);
});
