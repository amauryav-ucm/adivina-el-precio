const socket = io("https://test-9p0r.onrender.com");

document.getElementById("create-lobby-button").addEventListener("click", () => {
  createLobby("Amaury");
});

socket.on("connect", () => {
  console.log(`Conectado con id: ${socket.id}`);
});

async function createLobby(name) {
  console.log("Intentando crear un lobby");
  socket.emit("create-lobby", { playerName: name }, lobbyCode => {
    goToLobby(lobbyCode);
  });
}

function gotToLobby(lobbyCode) {
    window.location.href = `lobby.html?lobby=${lobbyCode}`;
}

async function joinLobby(lobbyId, playerName) {
  // Save name and lobbyId in localStorage or a global var
}
