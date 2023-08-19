const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/get-google-sheets', (req, res) => {
  const sheetURL = req.query.url;

  if (!sheetURL) {
    return res.status(400).send('URL parameter is required.');
  }
  
  axios.get(sheetURL)
    .then(response => {
      const sheetData = response.data;
      res.json(sheetData);
    })
    .catch(error => {
      console.error('Error fetching Google Sheets data:', error);
      res.status(500).send('Error fetching Google Sheets data.');
    });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
