const arena = document.getElementById('arena');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
let score = 0, timeLeft = 30, size = 90, ticker;

async function board(list) {
  const rows = list ?? await (await fetch('/api/scores')).json();
  document.getElementById('board').innerHTML =
    rows.map((r) => `<li>${r.name}<b>${r.score}</b></li>`).join('') || '<li>henüz yok</li>';
}

function spawn() {
  document.querySelector('.target')?.remove();
  const t = document.createElement('div');
  t.className = 'target';
  t.style.width = t.style.height = size + 'px';
  t.style.left = Math.random() * (arena.clientWidth - size) + 'px';
  t.style.top = Math.random() * (arena.clientHeight - size) + 'px';
  t.onclick = () => {
    score += 1;
    scoreEl.textContent = score;
    size = Math.max(34, size - 3); // her vuruşta küçülür
    spawn();
  };
  arena.appendChild(t);
}

async function finish() {
  clearInterval(ticker);
  document.querySelector('.target')?.remove();
  const name = document.getElementById('name').value;
  const rows = await (await fetch('/api/score', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, score }),
  })).json();
  board(rows);
  document.getElementById('intro').style.display = 'grid';
  document.querySelector('#intro h1').textContent = `Skorun: ${score}`;
  document.getElementById('start').textContent = 'Tekrar Oyna';
}

document.getElementById('start').onclick = () => {
  score = 0; timeLeft = 30; size = 90;
  scoreEl.textContent = '0'; timeEl.textContent = '30';
  document.getElementById('intro').style.display = 'none';
  spawn();
  ticker = setInterval(() => {
    timeEl.textContent = --timeLeft;
    if (timeLeft <= 0) finish();
  }, 1000);
};

board();
