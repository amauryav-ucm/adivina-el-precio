const socket = io('https://test-9p0r.onrender.com'); 

document.getElementById("create-lobby-button").addEventListener(e, () => {
  createLobby();
});

async function createLobby(name) {
  socket.emit('create-lobby', { playerName: name});

  socket.on('lobby-created', (lobby) => {
    window.location.href = `lobby.html?lobby=${lobby.lobbyId}`;
  })
}

async function joinLobby(lobbyId, playerName) {
  

  // Save name and lobbyId in localStorage or a global var
}
