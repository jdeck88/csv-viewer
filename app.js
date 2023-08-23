// here is an example we want to build using a local file....
const express = require('express');
const fs = require('fs'); // Import the fs module
const path = require('path'); // Import the path module
const csv = require('csv-parser'); // Import the csv-parser package
const config = require('./config'); // Load the config file
const app = express();

const port = 3300;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })) // for form data

app.post('/login', (req, res) => {
  const submittedUsername = req.body.username;
  const submittedPassword = req.body.password;

  if (
    submittedUsername === config.credentials.username &&
    submittedPassword === config.credentials.password
  ) {
    res.json({ success: true }); // Send success response
  } else {
    res.status(401).json({ error: 'Authentication failed' }); // Send error response
  }
});

app.get('/config.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'config.js'));
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});



app.get('/get-csv', (req, res) => {
  try {
    const csvFilePath = __dirname + '/data/cattle.csv';
    const csvArray = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv()) // Use csv-parser to parse the CSV file
      .on('data', (row) => {
        // Sanitize each field in the row
        for (const key in row) {
          row[key] = sanitizeField(row[key]);
        }
        csvArray.push(row);
      })
      .on('end', () => {
        res.json(csvArray);
      });
  } catch (error) {
    console.error('Error reading local CSV file:', error);
    res.status(500).send('Error reading local CSV file.');
  }
});

app.post('/save-csv', (req, res) => {
  try {
    const csvFilePath = __dirname + '/data/cattle.csv';
    const jsonData = req.body;
    const csvData = convertToCSV(jsonData);

    // Write CSV data to the file using fs module
    fs.writeFileSync(csvFilePath, csvData);

    res.send('CSV data saved successfully.');
  } catch (error) {
    console.error('Error saving CSV data:', error);
    res.status(500).send('Error saving CSV data.');
  }
});

// Function to sanitize fields (e.g., by quoting fields containing commas)
function sanitizeField(field) {
  if (field.includes(',')) {
    return `"${field}"`;
  }
  return field;
}
// Function to convert JSON data to CSV format
function convertToCSV(jsonData) {
  const keys = Object.keys(jsonData[0]);
  const header = keys.join(',') + '\n';
  const rows = jsonData.map(row => keys.map(key => row[key]).join(',')).join('\n');
  return header + rows;
}

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
