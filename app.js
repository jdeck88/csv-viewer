const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/get-csv', (req, res) => {
  const csvURL = req.query.url;

  if (!csvURL) {
    return res.status(400).send('URL parameter is required.');
  }

  axios.get(csvURL)
    .then(response => {
      const csvData = response.data;
      const csvRows = csvData.split('\n');
      const headers = csvRows[0].split(',');

      const csvArray = [];
      for (let i = 1; i < csvRows.length; i++) {
        const row = csvRows[i].split(',');
        const rowData = {};
        for (let j = 0; j < headers.length; j++) {
          rowData[headers[j]] = row[j];
        }
        csvArray.push(rowData);
      }

      res.json(csvArray);
    })
    .catch(error => {
      console.error('Error fetching CSV data:', error);
      res.status(500).send('Error fetching CSV data.');
    });
});

app.listen(port, () => {
 
