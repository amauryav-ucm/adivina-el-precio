const socket = io(getApiURL());

document.addEventListener('DOMContentLoaded', () => {
})

document.getElementById('create-lobby-button').addEventListener('click', () => {
    createLobby();
});

document.getElementById('join-lobby-button').addEventListener('click', () => {
    joinLobby(
        document.getElementById('lobby-code-input').value
    );
});

const lobbyCodeInput = document.getElementById('lobby-code-input');

lobbyCodeInput.addEventListener('input', function (event) {
    let value = lobbyCodeInput.value;
    value = value.replace(/[^a-zA-Z0-9]/g, '');
    value = value.toUpperCase();
    lobbyCodeInput.value = value;
});

socket.on('connect', () => {
    console.log(`Conectado con id: ${socket.id}`);
});
7;

async function createLobby() {
    console.log('Intentando crear un lobby');
    socket.emit('create-lobby', {}, (lobbyCode) => {
        goToLobby(lobbyCode);
    });
}

function goToLobby(_lobbyCode) {
    if (_lobbyCode === null) console.error('Error al unirse al lobby');
    else window.location.href = `lobby.html?lobby=${_lobbyCode}`;
}

async function joinLobby(_lobbyCode, _playerName) {
    console.log(
        `Intentando unirse al lobby ${_lobbyCode} con nombre ${_playerName}`
    );
    socket.emit(
        'join-lobby',
        {
            lobbyCode: _lobbyCode,
            playerName: _playerName,
        },
        (lobbyCode) => {
            goToLobby(lobbyCode);
        }
    );
}
