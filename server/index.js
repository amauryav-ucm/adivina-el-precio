const fs = require("fs");
const csv = require("csv-parser");

const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: { origin: "*" },
});

app.use(cors());

io.on("connection", (socket) => {
  console.log("A new user has connected: ", socket.id);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

let products = [];

// Read the CSV and load products into the array
fs.createReadStream("products.csv")
  .pipe(csv())
  .on("data", (row) => {
    products.push(row);
  })
  .on("end", () => {
    console.log("CSV file successfully processed");
  });

// Endpoint to get a random product
app.get("/api/random-product", (req, res) => {
  const randomIndex = Math.floor(Math.random() * products.length);
  res.json(products[randomIndex]);
});

let lobbies = {};

io.on('create-lobby', (data) => {
  const lobbyId = Math.random().toString(36).substring(2, 8).toUpperCase();
  lobbies[lobbyId] = {
    players: [socket.id],
    started: false,
  };

  io.emit('lobby-created', {lobbyId});
})

app.post("/api/lobby/create", (req, res) => {
  
});
