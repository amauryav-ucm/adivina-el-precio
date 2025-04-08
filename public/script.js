const socket = io("https://test-9p0r.onrender.com");

document.getElementById('create-lobby-button').addEventListener("click", () => {
  createLobby("Amaury");
});

document.getElementById('join-lobby-button').addEventListener("click", () => {
    joinLobby(
        document.getElementById('lobby-code-input').value,
        document.getElementById('player-name-input').value
    )
})

socket.on("connect", () => {
  console.log(`Conectado con id: ${socket.id}`);
});

async function createLobby(_playerName) {
  console.log("Intentando crear un lobby");
  socket.emit('create-lobby', { playerName: _playerName }, lobbyCode => {
    goToLobby(lobbyCode);
  });
}

function goToLobby(_lobbyCode) {
    if(_lobbyCode === null) 
        console.error('Error al unirse al lobby');
    window.location.href = `lobby.html?lobby=${_lobbyCode}`;
}

async function joinLobby(_lobbyCode, _playerName) {
  console.log(`Intentando unirse al lobby ${_lobbyCode} con nombre ${_playerName}`);
  socket.emit('join-lobby', {
    lobbyCode: _lobbyCode,
    playerName: _playerName
  }, lobbyCode => {
    goToLobby(lobbyCode);
  })
}
