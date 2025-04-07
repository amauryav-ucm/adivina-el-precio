const items = [
    { name: "iPhone 14", actualPrice: 999 },
    { name: "AirPods Pro", actualPrice: 249 },
    { name: "Samsung TV", actualPrice: 549 },
    { name: "PlayStation 5", actualPrice: 499 },
    { name: "LEGO Millennium Falcon", actualPrice: 849 },
  ];
  
  function scoreGuess(guess, actual) {
    const diff = Math.abs(guess - actual);
    if (diff === 0) return 100;
    if (diff <= 5) return 90;
    if (diff <= 20) return 75;
    if (diff <= 50) return 50;
    if (diff <= 100) return 25;
    return 0;
  }
  
  // For now, simulate guesses
  const guesses = [950, 200, 600, 550, 800];
  
  let totalScore = 0;
  for (let i = 0; i < items.length; i++) {
    const score = scoreGuess(guesses[i], items[i].actualPrice);
    console.log(`Guessed $${guesses[i]} for ${items[i].name} — Scored: ${score}`);
    totalScore += score;
  }
  
  console.log(`Total Score: ${totalScore} / 500`);
  