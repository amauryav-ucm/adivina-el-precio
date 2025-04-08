const socket = io('http://localhost:3001');
//const socket = io("https://test-9p0r.onrender.com");

const _lobbyCode = new URLSearchParams(window.location.search).get('lobby');
let rawInput = '';

document
    .getElementById('start-game-button')
    .addEventListener('click', startGame);

socket.on('connect', () => {
    console.log('Conectado el lobby al socket');
    socket.emit(
        'joined-lobby',
        {
            playerName: window.prompt('Escribe tu nombre'),
            lobbyCode: _lobbyCode,
        },
        (obj) => setUp(obj)
    );
});

socket.on('missing-lobby', () => {
    window.location.href = 'index.html';
});

function setUp(obj) {
    updatePlayers(obj.players);
}

function startGame() {
    console.log('Match started');
    socket.emit('start-game', { lobbyCode: _lobbyCode });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById(
        'lobby-code'
    ).textContent = `ID del Lobby: ${_lobbyCode}`;
});

socket.on('player-joined', (obj) => {
    console.log(`El juegador ${obj.playerName} se ha unido`);
    updatePlayers(obj.players);
});

socket.on('show-product', (obj) => {
    //console.log(obj.product);
    showNewItem(obj.product);
});

socket.on('time-finished', () => {
    let _guess =
        Number.parseFloat(document.getElementById('price-guess-input').value) ||
        0.0;
    console.log(`Se me ha acabado el tiempo, envaire un ${_guess}`);
    rawInput = '';
    socket.emit('send-guess', {
        lobbyCode: _lobbyCode,
        guess: _guess,
    });
});

socket.on('show-round-result', (obj) => {
    updatePlayers(obj.players);
    showRoundResult(obj.productPrice, obj.players);
});

function showNewItem(product) {
    itemPrice = product.precio;
    document.getElementById('main-content').innerHTML = `
          <div class='product-container' id="product-container" />
            <div class="product-container-image">
              <img src="${product.imagen}" alt="${product.nombre}" />
            </div>
            <div class="name-price">
              <h2>${product.nombre}</h2>
              <input type="number" step="0.01" min="0" id="price-guess-input" style="text-align: right;"/>
              <button id="submit-btn">Confirmar</button>
            <div>
          </div>
        `;
    document.getElementById('submit-btn').addEventListener('click', () => {
        makeGuess();
        currentRound += 1;
        if (currentRound >= attempts) {
            showFinalScore();
            return;
        }
        showResult();
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
        }
    });

    // Update the input field with formatted value
    function updateFormattedValue() {
        let num = parseFloat(rawInput) || 0;
        let formatted = (num / 100).toFixed(2); // force 2 decimal places
        inputField.value = formatted;
    }
}

function updatePlayers(players) {
    document.getElementById('player-table-content').innerHTML = '';
    const _sortedPlayers = Object.values(players).sort(
        (j1, j2) => j2.score - j1.score
    );
    for (const _player of _sortedPlayers) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td>${_player.name}</td>
        <td>${_player.score}</td>
      `;
        document.getElementById('player-table-content').appendChild(tr);
    }
}

function showRoundResult(productPrice, players) {
    document.getElementById('main-content').innerHTML = `
          <div class='result-container' id="result-container" />
            <div class="price-reveal">
              <h3>El precio era ${Number(productPrice).toFixed(2)} € </h3>
            </div>
            <table id="player-guess-table">
                    <thead>
                        <tr>
                            <th>Jugador</th>
                            <th>Respuesta</th>
                            <th>Puntos</th>
                        </tr>
                    </thead>
                    <tbody id="player-guess-table-content">
                    </tbody>
                </table>
          </div>
        `;
    const _sortedPlayers = Object.values(players).sort(
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

/*




  
  const attempts = 5;
  
  let currentRound = 0;
  let totalScore = 0;
  let itemPrice = 0.0;
  let guess = 0.0;
  let score = 0;
  
  const scoreBoard = document.getElementById("score");
  const container = document.getElementById("container");
  
  function showNewItem() {
    fetch("https://test-9p0r.onrender.com/api/random-product")
      .then((response) => response.json())
      .then((product) => {
        itemPrice = product.precio;
        container.innerHTML = `
          <div class="row" id = "product-container">
            <img src="${product.imagen}" alt="${product.nombre}" />
            <div class="name-price">
            <h2>${product.nombre}</h2>
            <input type="number" step="0.01" min="0" id="price-guess-input" style="text-align: right;"/>
            <button id="submit-btn">Confirmar</button>
            <div>
          </div>
        `;
        document.getElementById("submit-btn").addEventListener("click", () => {
          makeGuess();
          currentRound += 1;
          if (currentRound >= attempts) {
            showFinalScore();
            return;
          }
          showResult();
        });
        const inputField = document.getElementById("price-guess-input");
  
        // Handle keydown events
        inputField.addEventListener("keydown", (event) => {
          // Only allow digits (0-9) and the decimal point (.)
          if ((event.key >= "0" && event.key <= "9") || event.key === ".") {
            event.preventDefault();
            // Allow only one decimal point in the input
            if (event.key === "." && !rawInput.includes(".")) {
              rawInput += ".";
            } else if (event.key >= "0" && event.key <= "9") {
              rawInput += event.key;
            }
            updateFormattedValue();
          } else if (event.key === "Backspace") {
            event.preventDefault();
            rawInput = rawInput.slice(0, -1);
            updateFormattedValue();
          }
        });
  
        // Update the input field with formatted value
        function updateFormattedValue() {
          let num = parseFloat(rawInput) || 0;
          let formatted = (num / 100).toFixed(2); // force 2 decimal places
          inputField.value = formatted;
        }
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
      });
  }
  
  function showResult() {
    container.innerHTML = `
          <p>Has adivinado:\t${Number.parseFloat(guess).toFixed(2)} €</p>
          <p>Precio real:\t${Number.parseFloat(itemPrice).toFixed(2)} €</p>
          <p>Has ganado ${score} puntos</p>
      `;
    setTimeout(() => showNewItem(), "5000");
  }
  
  function makeGuess() {
    guess = parseFloat(document.getElementById("price-guess-input").value);
    score = scoreGuess(guess, itemPrice);
    rawInput = "";
    totalScore = Number(totalScore) + Number(score);
    updateScore();
  }
  
  function updateScore() {
    scoreBoard.innerText = totalScore;
  }
  
  function showFinalScore() {
    container.innerHTML = `
        <h2>Fin del juego!</h2>
        <p>Tu puntaje: ${totalScore}</p>
        <button id="restartBtn">Jugar otra vez</button>
      `;
  
    document.getElementById("restartBtn").addEventListener("click", () => {
      // reset game state
      totalScore = 0;
      currentRound = 0;
      updateScore();
      showNewItem();
    });
  }
  
  
  */
