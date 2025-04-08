const csv = require("csv-parser");
const fs = require("fs");

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

  socket.on('create-lobby', (obj, cb) => {
    console.log('Intentando crear un lobby');
    const _lobbyCode = createLobbyCode();
    lobbies[_lobbyCode] = {
      lobbyCode: _lobbyCode,
      players: {},
      active: false,
    };
    cb(_lobbyCode);
  });

  socket.on('join-lobby', (obj, cb) => {
    if (obj.lobbyCode in lobbies) {
      cb(obj.lobbyCode);
    } else {
      cb(null);
    }
  });

  socket.on('joined-lobby', (obj, cb) => {
    if (!(obj.lobbyCode in lobbies)) {
      socket.emit("missing-lobby");
      return;
    }
    console.log("Recibido nuevo jugador");
    lobbies[obj.lobbyCode].players[socket.id] = {
      name: obj.playerName,
      score: 0,
    };
    socket.join(obj.lobbyCode);
    socket.to(obj.lobbyCode).emit("player-joined", {
      playerName: obj.playerName,
      players: lobbies[obj.lobbyCode].players,
    });
    cb({ players: lobbies[obj.lobbyCode].players });
  });

  socket.on('start-game', (obj) => {
    game(obj.lobbyCode);
  });

  socket.on('send-score', (obj) => {
    console.log(`Jugador ${socket.id} ha enviado su puntaje ${obj.score}`);
    const _player = lobbies[obj.lobbyCode].players[socket.id]
    _player.score += obj.score;
    console.log(`Jugador ${_player.name} ha ganado ${obj.score} puntos, ahora tiene ${_player.score} puntos`)
  });
});

function createLobbyCode() {
  return Math.random().toString(36).substring(3, 8).toUpperCase();
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function game(_lobbyCode) {
  await wait(1000);
  const totalRounds = 5;
  let round = 0;
  while (round < totalRounds) {
    const _product = getRandomProduct();
    io.to(_lobbyCode).emit("show-product", { product: _product });
    await wait(10000);
    io.to(_lobbyCode).emit("time-finished");
  }

  await wait(1000);
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

function getRandomProduct() {
  const randomIndex = Math.floor(Math.random() * products.length);
  return products[randomIndex];
}
