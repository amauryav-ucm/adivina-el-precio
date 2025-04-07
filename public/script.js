const socket = io('https://test-9p0r.onrender.com'); 

document.getElementById("create-lobby-button").addEventListener("click", () => {
    socket.emit('message', {mensaje: "HOLA"});
});

socket.on("connect", () => {
    console.log(`Conectado con id: ${socket.id}`);
});


async function createLobby(name) {
    console.log('Intentando crear un lobby');
  socket.emit('create-lobby', { playerName: name});

  socket.on('lobby-created', (lobby) => {
    console.log(`Se ha creado un lobby con codigo: ${lobby.lobbyId}`)
    window.location.href = `lobby.html?lobby=${lobby.lobbyId}`;
  })
}

async function joinLobby(lobbyId, playerName) {
  

  // Save name and lobbyId in localStorage or a global var
}
