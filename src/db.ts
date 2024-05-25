import mysql from 'mysql';
export const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'sugoi',
  database: 'kurs',
});

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'sugoi',
  database: 'kurs',
});
