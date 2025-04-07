
function scoreGuess(guess, actual) {
    const diff = Math.abs(guess - actual);
    if (diff === 0) return 100;
    if (diff <= 5) return 90;
    if (diff <= 20) return 75;
    if (diff <= 50) return 50;
    if (diff <= 100) return 25;
    return 0;
}

const attempts = 5;

let currentRound = 0;
let totalScore = 0;
let itemPrice = 0.0;

const guessInput = document.getElementById('guess-input');
const submitBtn = document.getElementById('submit-btn');
const scoreBoard = document.getElementById('score');

function showNewItem() {
    fetch('https://test-9p0r.onrender.com/api/random-product')
        .then(response => response.json())
        .then(product => {
            console.log(product.precio);
            itemPrice = product.precio;
            const container = document.getElementById('container');
            container.innerHTML = `
        <div>
          <img src="${product.imagen}" alt="${product.nombre}" width="150" />
          <h2>${product.nombre}</h2>
        </div>
      `;
        })
        .catch(err => {
            console.error('Error fetching product:', err);
        });
}

function makeGuess() {
    totalScore += scoreGuess(parseFloat(guessInput.value), itemPrice);
    updateScore();
}

function updateScore() {
    scoreBoard.innerText = totalScore;
}

submitBtn.addEventListener('click', () => {
    makeGuess();
    currentRound += 1;
    if(currentRound >= attempts){
        showFinalScore();
        return;
    }
    showNewItem();
});

window.addEventListener('DOMContentLoaded', () => {
    showNewItem();
    updateScore();
});

function showFinalScore() {
    const container = document.getElementById('container');
    container.innerHTML = `
      <h2>Game Over!</h2>
      <p>Your score: ${totalScore}</p>
      <button id="restartBtn">Play Again</button>
    `;

    document.getElementById('restartBtn').addEventListener('click', () => {
        // reset game state
        totalScore = 0;
        currentRound = 0;
        updateScore();
        showNewItem();
    });
}

