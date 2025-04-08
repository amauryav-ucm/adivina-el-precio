const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;



const http = require("http").createServer();

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
})

const io = require("socket.io")(server, {
  cors: { origin: "*" },
});

let lobbies = {};

io.on('connection', (socket) => {
  console.log("A new user has connected: ", socket.id);
  socket.on('message', (message) => {
    console.log(message);
  });

  socket.on('create-lobby', (obj, cb) => {
    const _lobbyCode = createLobbyCode();
    lobbies[_lobbyCode] = {
      lobbyCode: _lobbyCode,
      players: {
        [socket.id]: obj.playerName
      },
      active: false
    };
    console.log(lobbies);
    cb(_lobbyCode);
  });

  socket.on('join-lobby', (obj, cb) => {
    if(obj.lobbyCode in lobbies){
      lobbies[obj.lobbyCode].players[socket.id] = obj.playerName;
      console.log(lobbies);
      cb(lobbyCode);
    } else {
      cb();
    }
  })
});

function createLobbyCode(){
  return Math.random().toString(36).substring(3,8).toUpperCase();
}

