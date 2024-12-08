const mysql = require('mysql2');

// Set up the connection
const db = mysql.createConnection({
  host: 'localhost',  // Replace with your DB host
  user: 'root',       // Your DB user
  password: 'root',       // Your DB password
  database: 'csv_data'  // Name of your database
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to the database.');
});

module.exports = db;
