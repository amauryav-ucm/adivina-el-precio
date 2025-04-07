const fs = require('fs');
const csv = require('csv-parser');

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());

io.on('connection', (socket) => {
  console.log('A new user has connected: ', socket.id)
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


let products = [];

// Read the CSV and load products into the array
fs.createReadStream('products.csv')
  .pipe(csv())
  .on('data', (row) => {
    products.push(row);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

// Endpoint to get a random product
app.get('/api/random-product', (req, res) => {
  const randomIndex = Math.floor(Math.random() * products.length);
  res.json(products[randomIndex]);
});
