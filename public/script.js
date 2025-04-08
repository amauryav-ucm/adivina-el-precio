const socket = io("http://localhost:3001");
//const socket = io("https://test-9p0r.onrender.com");

document.getElementById("create-lobby-button").addEventListener("click", () => {
  createLobby();
});

document.getElementById("join-lobby-button").addEventListener("click", () => {
  joinLobby(
    document.getElementById("lobby-code-input").value,
    document.getElementById("player-name-input").value
  );
});

socket.on("connect", () => {
  console.log(`Conectado con id: ${socket.id}`);
});7

async function createLobby() {
  console.log("Intentando crear un lobby");
  socket.emit("create-lobby", {}, (lobbyCode) => {
    goToLobby(lobbyCode);
  });
}

function goToLobby(_lobbyCode) {
  if (_lobbyCode === null) console.error("Error al unirse al lobby");
  else window.location.href = `lobby.html?lobby=${_lobbyCode}`;
}

async function joinLobby(_lobbyCode, _playerName) {
  console.log(
    `Intentando unirse al lobby ${_lobbyCode} con nombre ${_playerName}`
  );
  socket.emit(
    "join-lobby",
    {
      lobbyCode: _lobbyCode,
      playerName: _playerName,
    },
    (lobbyCode) => {
      goToLobby(lobbyCode);
    }
  );
}
