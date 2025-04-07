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
let guess = 0.0;

const scoreBoard = document.getElementById("score");
const container = document.getElementById("container");

function showNewItem() {
  fetch("https://test-9p0r.onrender.com/api/random-product")
    .then((response) => response.json())
    .then((product) => {
      itemPrice = product.precio;
      container.innerHTML = `
          <img src="${product.imagen}" alt="${product.nombre}" width="150" />
          <h2>${product.nombre}</h2>
          <input type="number" id="guess-input" placeholder="Enter your guess" />
          <button id="submit-btn">Submit Guess</button>
        
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
    })
    .catch((err) => {
      console.error("Error fetching product:", err);
    });
}

function showResult() {
    container.innerHTML = `
        <p>Has adivinado:\t${Number.parseFloat(guess).toFixed(2)} €</p>
        <p>Precio real:\t${Number.parseFloat(itemPrice).toFixed(2)} €</p>
    `
    setTimeout(()=> showNewItem(), "5000");
}

function makeGuess() {
  guess = parseFloat(document.getElementById("guess-input").value);
  totalScore += scoreGuess(guess, itemPrice);
  updateScore();
}

function updateScore() {
  scoreBoard.innerText = totalScore;
}

window.addEventListener("DOMContentLoaded", () => {
  showNewItem();
  updateScore();
});

function showFinalScore() {
  container.innerHTML = `
      <h2>Game Over!</h2>
      <p>Your score: ${totalScore}</p>
      <button id="restartBtn">Play Again</button>
    `;

  document.getElementById("restartBtn").addEventListener("click", () => {
    // reset game state
    totalScore = 0;
    currentRound = 0;
    updateScore();
    showNewItem();
  });
}
