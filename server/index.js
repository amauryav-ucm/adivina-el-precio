const csv = require('csv-parser');
const fs = require('fs');

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;

const http = require("http").createServer();

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

const io = require("socket.io")(server, {
  cors: { origin: "*" },
});

let lobbies = {};

io.on("connection", (socket) => {
  //console.log("A new user has connected: ", socket.id);
  socket.on("message", (message) => {
    console.log(message);
  });

  socket.on("create-lobby", (obj, cb) => {
    const _lobbyCode = createLobbyCode();
    lobbies[_lobbyCode] = {
      lobbyCode: _lobbyCode,
      players: {},
      active: false,
    };
    cb(_lobbyCode);
  });

  socket.on("join-lobby", (obj, cb) => {
    if (obj.lobbyCode in lobbies) {
      cb(obj.lobbyCode);
    } else {
      cb(null);
    }
  });
  socket.on("joined-lobby", (obj, cb) => {
    if (!(obj.lobbyCode in lobbies)) {
      socket.emit("missing-lobby");
      return;
    }
    console.log("Recibido nuevo jugador");
    lobbies[obj.lobbyCode].players[socket.id] = obj.playerName;
    socket.join(obj.lobbyCode);
    socket.to(obj.lobbyCode).emit("player-joined", {
      playerName: obj.playerName,
      players: lobbies[obj.lobbyCode].players,
    });
    cb({ players: lobbies[obj.lobbyCode].players });
  });

  socket.on('start-game', (obj) => {
    game(obj.lobbyCode);
  })
});

function createLobbyCode() {
  return Math.random().toString(36).substring(3, 8).toUpperCase();
}

function game(_lobbyCode) {
  setTimeout(() => {
    io.to(_lobbyCode).emit("show-product", { product: getRandomProduct() });
  });
}

let products = [];


fs.createReadStream("products.csv")
  .pipe(csv())
  .on("data", (row) => {
    products.push(row);
  })
  .on("end", () => {
    console.log("CSV file successfully processed");
  });


function getRandomProduct(){
  const randomIndex = Math.floor(Math.random() * products.length);
  return products[randomIndex];
};
