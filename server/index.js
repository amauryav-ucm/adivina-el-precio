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




const lobbies = {};

app.post('/api/lobby/create', (req, res) => {
  const lobbyId = Math.random().toString(36).substring(2, 8); // short random ID
  lobbies[lobbyId] = {
    players: [],
    started: false,
  };
  res.json({ lobbyId });
});

app.post('/api/lobby/:id/join', express.json(), (req, res) => {
  const lobbyId = req.params.id;
  const playerName = req.body.name;

  if (!lobbies[lobbyId]) {
    return res.status(404).json({ error: 'Lobby not found' });
  }

  if (lobbies[lobbyId].players.includes(playerName)) {
    return res.status(400).json({ error: 'Name already taken' });
  }

  lobbies[lobbyId].players.push(playerName);
  res.json({ success: true });
});

app.get('/api/lobby/:id', (req, res) => {
  const lobbyId = req.params.id;
  const lobby = lobbies[lobbyId];

  if (!lobby) return res.status(404).json({ error: 'Lobby not found' });

  res.json({ players: lobby.players, started: lobby.started });
});

app.post('/api/lobby/:id/start', (req, res) => {
  const lobbyId = req.params.id;

  if (!lobbies[lobbyId]) {
    return res.status(404).json({ error: 'Lobby not found' });
  }

  lobbies[lobbyId].started = true;
  res.json({ success: true });
});
