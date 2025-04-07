async function createLobby() {
  const res = await fetch("https://test-9p0r.onrender.com/api/lobby/create", {
    method: "POST",
  });
  const data = await res.json();
  const lobbyId = data.lobbyId;
  // Save lobbyId, maybe go to /lobby.html?lobby=XYZ
  window.location.href = `lobby.html?lobby=${lobbyId}`;
}

async function joinLobby(lobbyId, playerName) {
  const res = await fetch(
    `https://test-9p0r.onrender.com/api/lobby/${lobbyId}/join`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: playerName }),
    }
  );
  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  // Save name and lobbyId in localStorage or a global var
}
