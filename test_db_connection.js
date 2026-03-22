const mysql = require('mysql2/promise');
const { URL } = require('url');
require('dotenv').config({ path: 'c:/Users/ARYAN/Desktop/ked/backend/.env' });

async function testConnection() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set in .env');
    return;
  }

  console.log(`Connecting to: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`);
  const url = new URL(databaseUrl);
  
  try {
    const connection = await mysql.createConnection({
      host: url.hostname,
      port: url.port,
      user: url.username,
      password: url.password,
      database: url.pathname.replace(/^\//, ''),
      ssl: { rejectUnauthorized: false }
    });

    console.log('SUCCESS: Connected to the database!');
    const [rows] = await connection.query('SELECT 1');
    console.log('Query Result:', rows);
    await connection.end();
  } catch (error) {
    console.error('FAILURE: Could not connect to the database.');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
  }
}

testConnection();
