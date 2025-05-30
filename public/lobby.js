const socket = io(getApiURL());

const _lobbyCode = new URLSearchParams(window.location.search).get('lobby');
let rawInput = '';
let _guess;
const defaultNames = [
    'Tonto',
    'Imbécil',
    'Idiota',
    'Estúpido',
    'Burro',
    'Bobo',
    'Memo',
    'Zopenco',
    'Tarado',
    'Gilipollas',
    'Pelmazo',
    'Patán',
    'Ceporro',
    'Capullo',
    'Pendejo',
    'Boludo',
    'Huevón',
    'Mamón',
    'Lelo',
    'Subnormal',
];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById(
        'lobby-code'
    ).textContent = `ID del Lobby: ${_lobbyCode}`;
});

socket.on('connect', () => {
    console.log('Conectado el lobby al socket');
    socket.emit(
        'joined-lobby',
        {
            playerName:
                window.prompt('Escribe tu nombre') ||
                defaultNames[Math.floor(Math.random() * defaultNames.length)],
            lobbyCode: _lobbyCode,
        },
        (obj) => setUp(obj)
    );
});

socket.on('missing-lobby', () => {
    window.location.href = 'index.html';
});

socket.on('give-controls', showControlPanel);

function setUp(obj) {
    updatePlayers(obj);
}

socket.on('update-players', updatePlayers);

socket.on('show-product', showNewItem);

socket.on('time-finished', sendGuess);

socket.on('show-round-result', showRoundResult);

socket.on('game-finished', showFinalResult);

socket.on('game-error', () => {
    window.location.href = 'index.html';
});

function showNewItem(obj) {
    const _product = obj.product;
    itemPrice = _product.precio;
    const _guessTime = obj.guessTime;
    document.getElementById('main-content').innerHTML = `
          <div class="product-container" id="product-container">
              <div class="product-container-image">
                  <img src="${_product.imagen}" alt="${_product.nombre}" />
              </div>
              <div class="name-price">
                <div>
                  <h2>${_product.nombre}</h2>
                </div>
                <div id="price-area">
                    <div>
                    <input
                        type="text"
                        id="price-guess-input"
                        style="text-align: right"
                    />
                    </div>
                    <div>                
                    <button id="submit-btn">Confirmar</button>
                    </div>
                </div>
              </div>
          </div>
        `;
    document.getElementById('footer').innerHTML = `
    <div class="round-time-bar" style="--duration: ${_guessTime};">
  <div></div>
</div>
    `;
    document.getElementById('submit-btn').addEventListener('click', () => {
        _guess = document.getElementById('price-guess-input').value;
        document.getElementById('price-area').innerHTML = `
        <p id="guessed-price">${_guess} €</p>
      `;
    });

    const inputField = document.getElementById('price-guess-input');

    // Handle keydown events
    inputField.addEventListener('keydown', (event) => {
        // Only allow digits (0-9) and the decimal point (.)
        event.preventDefault();
        if ((event.key >= '0' && event.key <= '9') || event.key === '.') {
            // Allow only one decimal point in the input
            if (event.key === '.' && !rawInput.includes('.')) {
                rawInput += '.';
            } else if (event.key >= '0' && event.key <= '9') {
                rawInput += event.key;
            }
            updateFormattedValue();
        } else if (event.key === 'Backspace') {
            rawInput = rawInput.slice(0, -1);
            updateFormattedValue();
        } else if (event.key === 'Enter') {
            _guess = document.getElementById('price-guess-input').value;
            document.getElementById('price-area').innerHTML = `
            <p id="guessed-price">${_guess} €</p>
            `;
        }
    });

    // Update the input field with formatted value
    function updateFormattedValue() {
        let num = parseFloat(rawInput) || 0;
        let formatted = (num / 100).toFixed(2); // force 2 decimal places
        inputField.value = formatted;
    }
}

function updatePlayers(obj) {
    const _players = obj.players;
    document.getElementById('player-table-content').innerHTML = '';
    const _sortedPlayers = Object.entries(_players).sort(
        ([, j1], [, j2]) => j2.score - j1.score
    );
    for (const [_socketId, _player] of _sortedPlayers) {
        console.log(`${_socketId} es igual a ${socket.id}`);
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td>${_player.name}${_socketId === socket.id ? ' (Tú)' : ''}</td>
        <td>${_player.score}</td>
      `;
        document.getElementById('player-table-content').appendChild(tr);
    }
}

function showRoundResult(obj) {
    const _productPrice = obj.productPrice;
    const _players = obj.players;
    updatePlayers(obj);
    document.getElementById('main-content').innerHTML = `
          <div class="result-container" id="result-container" />
              <div class="price-reveal">
                  <p>El precio era ${Number(_productPrice).toFixed(2)} €</p>
              </div>
              <table id="player-guess-table">
                  <thead>
                      <tr>
                          <th>Jugador</th>
                          <th>Respuesta</th>
                          <th>Puntos</th>
                      </tr>
                  </thead>
                  <tbody id="player-guess-table-content"></tbody>
              </table>
        `;
    const _sortedPlayers = Object.values(_players).sort(
        (j1, j2) => j2.lastPoints - j1.lastPoints
    );
    for (const _player of _sortedPlayers) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td>${_player.name}</td>
        <td>${Number(_player.lastGuess).toFixed(2)} €</td>
        <td>${_player.lastPoints}</td>
      `;
        document.getElementById('player-guess-table-content').appendChild(tr);
    }
}

function showControlPanel() {
    document.getElementById('main-content').innerHTML = `
          <div class='control-panel-container' id="control-panel-container" />
            
                <label for="total-rounds-input">Numero de rondas</label>
                <input id="total-rounds-input" type="number" value="10">
                <label for="guess-time-input">Tiempo para responder (segundos)</label>
                <input id="guess-time-input" type="number" value="15">
                <button id="start-game-button">Iniciar partida</button>
        `;
    document
        .getElementById('start-game-button')
        .addEventListener('click', () => {
            console.log('boton');
            startGame(
                Number(document.getElementById('total-rounds-input').value),
                Number(document.getElementById('guess-time-input').value) * 1000
            );
        });
}

function sendGuess() {
    const _textBox = document.getElementById('price-guess-input');
    let guess;
    if (_textBox) {
        _guess =
            Number.parseFloat(
                document.getElementById('price-guess-input').value
            ) || 0.0;
    }
    document.getElementById('footer').innerHTML = '';
    document.getElementById('main-content').innerHTML = '';
    rawInput = '';
    socket.emit('send-guess', {
        lobbyCode: _lobbyCode,
        guess: _guess,
    });
}

function showFinalResult(obj) {
    const _sortedPlayers = Object.values(obj.players).sort(
        (j1, j2) => j2.score - j1.score
    );
    document.getElementById('main-content').innerHTML = `
          <div class='result-container' id="result-container" />
            <div class="price-reveal">
              <h3>Ha ganado ${_sortedPlayers[0].name} :) </h3>
            </div>
        `;
}

function startGame(_totalRounds, _guessTime) {
    console.log('Match started');
    socket.emit('start-game', {
        lobbyCode: _lobbyCode,
        totalRounds: _totalRounds,
        guessTime: _guessTime,
    });
}
