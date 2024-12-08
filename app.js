const express = require('express');
const path = require('path');
const app = express();
const multer = require('multer');
const db = require('./db');
const moment = require('moment');
const cors = require('cors');
const port = 5001;


// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Define routes
app.get('/', (req, res) => {
  var answer = [];
  const query = 'SELECT * FROM shifts_data';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      return res.status(500).send('Error fetching data');
    }
        // Format dates in the results
        const formattedResults = results.map(row => ({
          ...row,
          ShiftBookedDate: moment(row.ShiftBookedDate).format('DD-MM-YYYY'), // Change format as needed
          ShiftDate: moment(row.ShiftDate).format('DD-MM-YYYY'), // Change format as needed
        }));
    // Render the EJS template with the fetched data
    res.render('index', { tableData: formattedResults });
  });

  //res.render('index', { tableData: answer }); // Render the index.ejs file
});

// Configure storage for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Save files to the "uploads" directory
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Rename file with a timestamp
    }
  });
  
  // Filter for CSV files
  const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed!'), false);
    }
  };
  
  // Initialize Multer
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter
  });

// Start the server
//const PORT = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

const fs = require('fs'); // For file system operations
const csv = require('csv-parser'); // CSV parser

/*
// POST route to handle CSV uploads
app.post('/upload', upload.single('csvFile'), (req, res) => {
  const filePath = req.file.path; // Path of the uploaded file
  const results = []; // Array to store parsed CSV data

  // Read and parse the CSV file
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // Delete the uploaded file after parsing
      fs.unlinkSync(filePath);
      
      // Render the table with parsed data
      res.render('index', { tableData: results });
    })
    .on('error', (error) => {
      console.error(error);
      res.status(500).send('Error processing the file');
    });
});
*/

app.post('/upload', upload.single('csvFile'), (req, res) => {
    const filePath = req.file.path;
    const results = [];
  
    // Parse CSV and insert data into the database
    fs.createReadStream(filePath)
    //.pipe(csv({headers: true}))
     .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        // Insert data into the database
        results.forEach((row) => {
            const { consname, ShiftBookedDate, ShiftDate, Status, role, Candidate, Candidate_Mobile, Candidate_Email, ClName, FilledBy } = row;
        
          
            // Convert ShiftBookedDate to the correct format (YYYY-MM-DD)
            const formattedShiftBookedDate = moment(ShiftBookedDate, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD');
          
            // Convert ShiftDate to the correct format (YYYY-MM-DD)
            const formattedShiftDate = moment(ShiftDate, 'DD-MMM-YY').format('YYYY-MM-DD');
          
            const query = 'INSERT INTO shifts_data (consname, ShiftBookedDate, ShiftDate, Status, role, Candidate, Candidate_Mobile, Candidate_Email, ClName, FilledBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            db.query(query, [row['consname'], formattedShiftBookedDate, formattedShiftDate, Status, role, Candidate, Candidate_Mobile, Candidate_Email, ClName, FilledBy], (err, result) => {
              if (err) {
                console.error('Error inserting data:', err);
              }
          });
        });
  
        // Delete the uploaded file after processing
        fs.unlinkSync(filePath);
  
        // Render the table with parsed data
        res.render('index', { tableData: results });
      })
      .on('error', (error) => {
        console.error(error);
        res.status(500).send('Error processing the file');
      });
  });

  app.post('/upload2', upload.single('csvFile'), (req, res) => {
    const filePath = req.file.path;
    const results = [];
  
    // Parse CSV and insert data into the database
    fs.createReadStream(filePath)
      .pipe(csv({headers: true}))
     // .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        // Insert data into the database
        results.forEach((row) => {
            const { consname, ShiftBookedDate, ShiftDate, Status, role, Candidate, Candidate_Mobile, Candidate_Email, ClName, FilledBy } = row;
            
            Object.keys(row).forEach(key => {
                //console.log(`Key: '${key}'`);  // Logs all keys to check for extra spaces or odd characters
                //console.log(`Value: ${row[key]}`);
              });
            
            // Convert ShiftBookedDate to the correct format (YYYY-MM-DD)
            const formattedShiftBookedDate = moment(row._1, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD');

          
            // Convert ShiftDate to the correct format (YYYY-MM-DD)
            const formattedShiftDate = moment(row._2, 'DD-MMM-YY').format('YYYY-MM-DD');

            
            const query = 'INSERT INTO shifts_data (consname, ShiftBookedDate, ShiftDate, Status, role, Candidate, Candidate_Mobile, Candidate_Email, ClName, FilledBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            db.query(query, [row._0, formattedShiftBookedDate, formattedShiftDate, row._3, row._4, row._5, row._6, row._7, row._8, row._9], (err, result) => {
              if (err) {
                console.error('Error inserting data:', err);
              }
          });
          
        });
  
        // Delete the uploaded file after processing
        fs.unlinkSync(filePath);
  
        // Render the table with parsed data
        res.render('index', { tableData: results });
      })
      .on('error', (error) => {
        console.error(error);
        res.status(500).send('Error processing the file');
      });

  });

  app.get('/api/shifts', (req, res) => {
    const query = 'SELECT consname, ShiftBookedDate, ShiftDate, Status, role, Candidate, Candidate_Mobile, Candidate_Email, ClName, FilledBy FROM shifts_data';
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        return res.status(500).send('Error fetching data');
      }
      res.json(results); // Send data as JSON for Vue.js
    });
  });

  app.get('/shifts', (req, res) => {
    db.query('SELECT * FROM shifts_data', (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error retrieving shifts data');
      }
      console.log(results);
      res.json(results); // Send the data as JSON to the frontend
    });
  });