const express = require('express');
const cors = require('cors');
const csv = require('csv-parser');
const fs = require('fs');

const app = express();
const port = 3000;

// Enable CORS for all domains
app.use(cors());

// Store the products in memory
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

// Endpoint to get a subset of products for pagination or display
app.get('/api/products', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;  // Number of products per page

  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;
  const paginatedProducts = products.slice(startIndex, endIndex);

  res.json(paginatedProducts);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});