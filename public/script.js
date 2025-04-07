  function scoreGuess(guess, actual) {
    const diff = Math.abs(guess - actual);
    if (diff === 0) return 100;
    if (diff <= 5) return 90;
    if (diff <= 20) return 75;
    if (diff <= 50) return 50;
    if (diff <= 100) return 25;
    return 0;
  }
  
  let currentIndex = 0;
  let totalScore = 0;
  
  const itemNameEl = document.getElementById('item-name');
  const guessInput = document.getElementById('guess-input');
  const submitBtn = document.getElementById('submit-btn');
  const feedbackEl = document.getElementById('feedback');
  const finalScoreEl = document.getElementById('final-score');
  
  function showItem(item) {
    itemNameEl.textContent = `Item ${currentIndex + 1}: ${item.nombre}`;
    guessInput.value = '';
    feedbackEl.textContent = '';
  }
  
  submitBtn.addEventListener('click', () => {
    const guess = parseInt(guessInput.value);
    if (isNaN(guess)) {
      feedbackEl.textContent = 'Please enter a number!';
      return;
    }
  
    const item = items[currentIndex];
    const score = scoreGuess(guess, item.actualPrice);
    totalScore += score;
  
    feedbackEl.textContent = `You guessed $${guess}. Actual price: $${item.actualPrice}. You scored ${score} points.`;
  
    currentIndex++;
    if (currentIndex < items.length) {
      setTimeout(() => {
        fetch('https://test-9p0r.onrender.com/api/random-product')
        .then(res => res.json())
        .then(item => showItem(item));
      }, 1500);
    } else {
      submitBtn.disabled = true;
      guessInput.disabled = true;
      finalScoreEl.textContent = `🏁 Game over! Your total score: ${totalScore} / ${items.length * 100}`;
    }
  });
  
  showItem();
  