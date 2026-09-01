const ROUND_SECONDS = 30;
const START_SIZE = 64;
const MIN_SIZE = 24;
const SHRINK_STEP = 3;

const playArea = document.getElementById('play-area');
const target = document.getElementById('target');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const endScreen = document.getElementById('end-screen');
const startBtn = document.getElementById('start-btn');
const finalScoreEl = document.getElementById('final-score');
const nameForm = document.getElementById('name-form');
const nameInput = document.getElementById('player-name');
const resultSection = document.getElementById('result-section');
const leaderboardEl = document.getElementById('leaderboard');
const playAgainBtn = document.getElementById('play-again-btn');

// Every round gets a fresh state object; nothing survives between rounds.
let round = null;

function createRound() {
  return { score: 0, timeLeft: ROUND_SECONDS, targetSize: START_SIZE, intervalId: null };
}

function updateHud() {
  timerEl.textContent = round.timeLeft;
  scoreEl.textContent = round.score;
}

function placeTarget() {
  const size = round.targetSize;
  const maxX = Math.max(playArea.clientWidth - size, 0);
  const maxY = Math.max(playArea.clientHeight - size, 0);
  target.style.width = `${size}px`;
  target.style.height = `${size}px`;
  target.style.left = `${Math.floor(Math.random() * maxX)}px`;
  target.style.top = `${Math.floor(Math.random() * maxY)}px`;
}

function onTargetHit(event) {
  event.stopPropagation();
  round.score += 1;
  round.targetSize = Math.max(MIN_SIZE, round.targetSize - SHRINK_STEP);
  updateHud();
  placeTarget();
  target.classList.remove('hit');
  void target.offsetWidth;
  target.classList.add('hit');
}

function tick() {
  round.timeLeft -= 1;
  updateHud();
  if (round.timeLeft <= 0) {
    endRound();
  }
}

function startRound() {
  round = createRound();
  startScreen.hidden = true;
  endScreen.hidden = true;
  resultSection.hidden = true;
  nameForm.hidden = false;
  nameInput.value = '';
  target.hidden = false;
  updateHud();
  placeTarget();
  round.intervalId = setInterval(tick, 1000);
}

function endRound() {
  clearInterval(round.intervalId);
  round.intervalId = null;
  target.hidden = true;
  finalScoreEl.textContent = round.score;
  endScreen.hidden = false;
}

async function fetchTopScores() {
  const res = await fetch('/api/scores');
  return res.ok ? res.json() : [];
}

function renderLeaderboard(scores, freshId) {
  leaderboardEl.innerHTML = '';
  for (const entry of scores) {
    const li = document.createElement('li');
    li.textContent = `${entry.name} - ${entry.score}`;
    if (entry.id === freshId) {
      li.classList.add('fresh');
    }
    leaderboardEl.appendChild(li);
  }
}

async function submitScore(finalScore) {
  const res = await fetch('/api/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nameInput.value, score: finalScore }),
  });
  if (!res.ok) {
    return;
  }
  const saved = await res.json();
  const scores = await fetchTopScores();
  renderLeaderboard(scores, saved.id);
  nameForm.hidden = true;
  resultSection.hidden = false;
}

target.addEventListener('click', onTargetHit);
startBtn.addEventListener('click', startRound);
playAgainBtn.addEventListener('click', startRound);
nameForm.addEventListener('submit', (event) => {
  event.preventDefault();
  submitScore(round.score);
});
