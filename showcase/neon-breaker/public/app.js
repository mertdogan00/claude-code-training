'use strict';

/* ===================== Storage helpers ===================== */

const DEFAULT_SETTINGS = { sound: true, difficulty: 'orta', theme: 'nebula', paddle: 'orta' };
const DEFAULT_PROGRESS = { unlocked: 1, achievements: [], powerupsCollected: 0 };

function safeParse(raw, fallback) {
  if (!raw) return { ...fallback };
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...fallback };
    return { ...fallback, ...parsed };
  } catch {
    return { ...fallback };
  }
}

function loadPlayer() {
  const raw = localStorage.getItem('nb.player');
  const clean = (typeof raw === 'string') ? sanitizePlayerName(raw) : '';
  return clean || 'Oyuncu';
}
function savePlayer(name) { localStorage.setItem('nb.player', name); }

// Mirror of the server rule for POST /api/scores, so a name the player picks
// here can never be rejected when the score is posted.
function sanitizePlayerName(raw) {
  return String(raw).replace(/[^a-zA-Z0-9 _\-çÇğĞıİiöÖşŞüÜ]/gu, '').trim().slice(0, 12).trim();
}

function loadSettings() { return safeParse(localStorage.getItem('nb.settings'), DEFAULT_SETTINGS); }
function saveSettings(s) { localStorage.setItem('nb.settings', JSON.stringify(s)); }

function loadProgress() { return safeParse(localStorage.getItem('nb.progress'), DEFAULT_PROGRESS); }
function saveProgress(p) { localStorage.setItem('nb.progress', JSON.stringify(p)); }

let player = loadPlayer();
let settings = loadSettings();
let progress = loadProgress();

/* ===================== Fallback level data ===================== */

const FALLBACK_LEVELS = [
  {
    id: 1, name: 'Başlangıç', speed: 1.0, rows: 4, cols: 8,
    grid: [
      [1,1,1,1,1,1,1,1],
      [1,1,0,1,1,0,1,1],
      [1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,0],
    ],
  },
  {
    id: 2, name: 'Hızlanma', speed: 1.15, rows: 5, cols: 9,
    grid: [
      [1,1,2,1,1,1,2,1,1],
      [1,2,1,1,0,1,1,2,1],
      [1,1,1,2,1,2,1,1,1],
      [0,1,1,1,1,1,1,1,0],
      [1,1,0,1,1,1,0,1,1],
    ],
  },
  {
    id: 3, name: 'Kırılma', speed: 1.3, rows: 5, cols: 10,
    grid: [
      [1,1,1,3,1,1,3,1,1,1],
      [2,1,2,1,1,1,1,2,1,2],
      [1,1,1,1,0,0,1,1,1,1],
      [1,2,1,2,1,1,2,1,2,1],
      [0,1,1,1,1,1,1,1,1,0],
    ],
  },
  {
    id: 4, name: 'Fırtına', speed: 1.45, rows: 6, cols: 10,
    grid: [
      [1,1,1,1,1,1,1,1,1,1],
      [1,3,2,1,1,1,1,2,3,1],
      [2,1,1,1,3,3,1,1,1,2],
      [1,1,2,1,1,1,1,2,1,1],
      [0,2,1,1,0,0,1,1,2,0],
      [1,1,1,1,1,1,1,1,1,1],
    ],
  },
  {
    id: 5, name: 'Çekirdek', speed: 1.6, rows: 6, cols: 10,
    grid: [
      [3,1,2,1,1,1,1,2,1,3],
      [1,2,1,1,3,3,1,1,2,1],
      [2,1,1,3,1,1,3,1,1,2],
      [1,1,3,1,1,1,1,3,1,1],
      [1,2,1,1,2,2,1,1,2,1],
      [0,1,1,1,1,1,1,1,1,0],
    ],
  },
];

const FALLBACK_ACHIEVEMENTS = [
  { id: 'ilk-bolum', title: 'İlk Bölüm', description: 'Bir bölümü temizle' },
  { id: 'kayipsiz', title: 'Kayıpsız', description: 'Can kaybetmeden bir bölümü bitir' },
  { id: 'kombo-10', title: 'Kombo 10', description: '10 kombo yap' },
  { id: 'guc-toplayici', title: 'Güç Toplayıcı', description: 'Bir turda dört farklı güçlendirme türünü topla' },
  { id: 'bes-bin', title: 'Beş Bin', description: 'Tek oyunda 5000 puan topla' },
];

let levels = FALLBACK_LEVELS;
let achievementDefs = FALLBACK_ACHIEVEMENTS;

async function loadLevels() {
  try {
    const res = await fetch('/api/levels');
    if (!res.ok) throw new Error('bad status');
    const data = await res.json();
    if (Array.isArray(data.levels) && data.levels.length) levels = data.levels;
  } catch {
    levels = FALLBACK_LEVELS;
  }
  renderLevelGrid();
}

async function loadAchievementDefs() {
  try {
    const res = await fetch('/api/achievements');
    if (!res.ok) throw new Error('bad status');
    const data = await res.json();
    if (Array.isArray(data.achievements) && data.achievements.length) achievementDefs = data.achievements;
  } catch {
    achievementDefs = FALLBACK_ACHIEVEMENTS;
  }
  renderAchievements();
}

/* ===================== Theme ===================== */

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* ===================== Toasts ===================== */

const toastStack = document.getElementById('toast-stack');
function showToast(text) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  toastStack.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/* ===================== Router ===================== */

const SCREENS = ['start', 'game', 'scores', 'settings'];
let currentScreen = 'start';
let booted = false;

function showScreen(name) {
  if (!SCREENS.includes(name)) return;
  currentScreen = name;
  document.body.dataset.screen = name;
  for (const s of SCREENS) {
    const el = document.getElementById(`screen-${s}`);
    el.classList.toggle('active', s === name);
    if (s === name && booted) {
      el.classList.add('screen-enter');
      el.addEventListener('animationend', () => el.classList.remove('screen-enter'), { once: true });
    } else {
      el.classList.remove('screen-enter');
    }
  }
  document.querySelectorAll('.navlink').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.nav === name);
  });
  document.querySelectorAll('.tab').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.nav === name);
  });
  if (name === 'scores') { fetchScores(); renderAchievements(); }
  if (name !== 'game') pauseIfRunning();
}

document.querySelectorAll('[data-nav]').forEach((btn) => {
  btn.addEventListener('click', () => showScreen(btn.dataset.nav));
});

/* ===================== Profile chip ===================== */

const avatarEl = document.getElementById('avatar-initial');
const playerNameEl = document.getElementById('player-name');
const heroPlayerNameEl = document.getElementById('hero-player-name');

function renderProfile() {
  const initial = player.trim().charAt(0).toUpperCase() || '?';
  avatarEl.textContent = initial;
  playerNameEl.textContent = player;
  heroPlayerNameEl.textContent = player;
}
renderProfile();

const renameModal = document.getElementById('rename-modal');
const renameInput = document.getElementById('rename-input');
document.getElementById('profile-chip').addEventListener('click', () => {
  renameInput.value = player;
  renameModal.classList.remove('hidden');
  renameInput.focus();
});
document.getElementById('rename-cancel').addEventListener('click', () => renameModal.classList.add('hidden'));
document.getElementById('rename-save').addEventListener('click', () => {
  const val = sanitizePlayerName(renameInput.value);
  if (val) {
    player = val;
    savePlayer(player);
    renderProfile();
  }
  renameModal.classList.add('hidden');
});
renameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('rename-save').click();
  if (e.key === 'Escape') renameModal.classList.add('hidden');
});

/* ===================== Level select ===================== */

const levelGrid = document.getElementById('level-grid');

function renderLevelGrid() {
  levelGrid.innerHTML = '';
  levels.forEach((lvl, idx) => {
    const num = idx + 1;
    const locked = num > progress.unlocked;
    const card = document.createElement('div');
    card.className = `level-card ${locked ? 'locked' : 'playable'}`;
    card.innerHTML = `
      <div class="level-num">${num}</div>
      <div class="level-name">${lvl.name}</div>
      ${locked ? '<div class="lock-hint">Önceki bölümü bitir</div>' : ''}
    `;
    if (!locked) card.addEventListener('click', () => startGame(idx));
    levelGrid.appendChild(card);
  });
}

document.getElementById('btn-oyna').addEventListener('click', () => {
  const idx = Math.min(progress.unlocked - 1, levels.length - 1);
  startGame(Math.max(0, idx));
});

/* ===================== Settings screen ===================== */

const soundToggle = document.getElementById('setting-sound');
const difficultySeg = document.getElementById('setting-difficulty');
const themeSeg = document.getElementById('setting-theme');
const paddleSeg = document.getElementById('setting-paddle');

function renderSettingsUI() {
  soundToggle.setAttribute('aria-checked', String(settings.sound));
  [difficultySeg, themeSeg, paddleSeg].forEach((seg) => {
    const key = seg.id.replace('setting-', '');
    seg.dataset.value = settings[key];
    seg.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.value === settings[key]));
  });
}
renderSettingsUI();
applyTheme(settings.theme);

soundToggle.addEventListener('click', () => {
  settings.sound = !settings.sound;
  saveSettings(settings);
  renderSettingsUI();
});

function wireSegmented(seg, onChange) {
  seg.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.value;
      seg.dataset.value = val;
      seg.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
      onChange(val);
    });
  });
}

wireSegmented(difficultySeg, (val) => { settings.difficulty = val; saveSettings(settings); });
wireSegmented(themeSeg, (val) => {
  settings.theme = val;
  saveSettings(settings);
  applyTheme(val);
});
wireSegmented(paddleSeg, (val) => {
  settings.paddle = val;
  saveSettings(settings);
  if (game.running) resizePaddleForSetting();
});

const resetBtn = document.getElementById('btn-reset-progress');
let resetArmed = false;
resetBtn.addEventListener('click', () => {
  if (!resetArmed) {
    resetArmed = true;
    resetBtn.textContent = 'Emin misin? Tekrar tıkla';
    resetBtn.classList.add('confirm');
    setTimeout(() => {
      resetArmed = false;
      resetBtn.textContent = 'Sıfırla';
      resetBtn.classList.remove('confirm');
    }, 3500);
    return;
  }
  progress = { ...DEFAULT_PROGRESS };
  saveProgress(progress);
  renderLevelGrid();
  renderAchievements();
  resetArmed = false;
  resetBtn.textContent = 'Sıfırla';
  resetBtn.classList.remove('confirm');
  showToast('İlerleme sıfırlandı');
});

/* ===================== Scores screen ===================== */

const scoresPanel = document.getElementById('scores-panel');
let lastPostedId = null;

function emptyStateHTML(icon, text) {
  return `
    <div class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${icon}</svg>
      <p>${text}</p>
    </div>`;
}

const ICON_EMPTY = '<circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/>';
const ICON_ERROR = '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>';

const scoreFormatter = new Intl.NumberFormat('tr-TR');
function formatScore(n) {
  return scoreFormatter.format(n);
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

async function fetchScores() {
  scoresPanel.innerHTML = `
    <div class="loading-state" id="scores-loading">
      <div class="spinner-neon"></div>
      <p>Skorlar yükleniyor...</p>
    </div>`;
  try {
    const res = await fetch('/api/scores?limit=10');
    if (!res.ok) throw new Error('bad status');
    const data = await res.json();
    const list = Array.isArray(data.scores) ? data.scores : [];
    if (!list.length) {
      scoresPanel.innerHTML = emptyStateHTML(ICON_EMPTY, 'Henüz skor yok. İlk skoru sen bırak.');
      return;
    }
    scoresPanel.innerHTML = list.map((row, i) => `
      <div class="score-row ${row.id === lastPostedId ? 'fresh' : ''}">
        <span class="rank">#${i + 1}</span>
        <span class="score-name">${escapeHTML(row.name)}</span>
        <span class="score-value">${formatScore(row.score)}</span>
        <span class="score-level">Bölüm ${row.level}</span>
        <span class="score-date">${formatDate(row.created_at)}</span>
      </div>
    `).join('');
  } catch {
    scoresPanel.innerHTML = emptyStateHTML(ICON_ERROR, 'Skor tablosu yüklenemedi. Bağlantıyı kontrol et.');
  }
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function postScore(score, level) {
  try {
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: player, score, level }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      lastPostedId = data.id;
      return data.rank;
    }
  } catch { /* offline, ignore */ }
  return null;
}

/* ===================== Achievements ===================== */

const achievementsGrid = document.getElementById('achievements-grid');

function renderAchievements() {
  if (!achievementDefs.length) {
    achievementsGrid.innerHTML = emptyStateHTML(ICON_EMPTY, 'Başarım listesi yüklenemedi.');
    return;
  }
  achievementsGrid.innerHTML = achievementDefs.map((a) => {
    const earned = progress.achievements.includes(a.id);
    return `
      <div class="achievement-card ${earned ? 'earned' : ''}">
        <div class="a-icon">${earned ? '★' : '•'}</div>
        <div class="a-title">${a.title}</div>
        <div class="a-desc">${a.description}</div>
      </div>`;
  }).join('');
}

function grantAchievement(id) {
  if (progress.achievements.includes(id)) return;
  progress.achievements.push(id);
  saveProgress(progress);
  const def = achievementDefs.find((a) => a.id === id);
  showToast(`Başarım kazanıldı: ${def ? def.title : id}`);
  if (currentScreen === 'scores') renderAchievements();
}

/* ===================== Audio (synthesized, lazy) ===================== */

let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
['pointerdown', 'keydown'].forEach((ev) => window.addEventListener(ev, () => { if (settings.sound) ensureAudio(); }, { once: true }));

function tone(freq, dur, type = 'sine', gainPeak = 0.15, delay = 0) {
  if (!settings.sound) return;
  const ctx = ensureAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ctx.currentTime + delay;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(gainPeak, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function sfxPaddle() { tone(300, 0.06, 'sine', 0.12); }
function sfxBrick(row) { tone(880 - row * 55, 0.09, 'square', 0.1); }
function sfxPowerup() { tone(660, 0.08, 'triangle', 0.14); tone(990, 0.1, 'triangle', 0.12, 0.07); }
function sfxLifeLost() { tone(110, 0.3, 'sawtooth', 0.16); }
function sfxLevelClear() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'triangle', 0.12, i * 0.09)); }

/* ===================== Game constants ===================== */

const PADDLE_WIDTHS = { kisa: 64, orta: 96, uzun: 136 };
const DIFFICULTY = {
  kolay: { speedMult: 0.85, lives: 4 },
  orta: { speedMult: 1.0, lives: 3 },
  zor: { speedMult: 1.25, lives: 2 },
};
const BASE_BALL_SPEED = 260;
const POWERUP_TYPES = ['coklu', 'genis', 'yavas', 'can'];
const POWERUP_LABELS = { coklu: 'Çoklu Top', genis: 'Geniş Raket', yavas: 'Yavaş Top', can: 'Ekstra Can' };
const FIXED_DT = 1 / 60;

/* ===================== Canvas setup ===================== */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let fieldW = 0, fieldH = 0;

function fitCanvas() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  fieldW = rect.width;
  fieldH = rect.height;
  canvas.width = Math.round(fieldW * dpr);
  canvas.height = Math.round(fieldH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', () => { fitCanvas(); if (game.running) layoutForField(); });
window.addEventListener('orientationchange', () => { fitCanvas(); if (game.running) layoutForField(); });

/* ===================== Game state ===================== */

const game = {
  running: false,
  paused: false,
  levelIndex: 0,
  level: null,
  score: 0,
  lives: 3,
  combo: 0,
  bricks: [],
  balls: [],
  particles: [],
  powerups: [],
  activeEffects: {},
  paddle: { x: 0, y: 0, w: 96, h: 14 },
  shake: 0,
  flash: 0,
  livesLostThisLevel: 0,
  powerupTypesThisRound: [],
  ballLaunched: false,
  countdown: 0,
  accumulator: 0,
  lastTime: 0,
  frameHandle: null,
  brickSize: { w: 0, h: 0, top: 0 },
};

function difficultyConf() { return DIFFICULTY[settings.difficulty] || DIFFICULTY.orta; }

function resizePaddleForSetting() {
  game.paddle.w = PADDLE_WIDTHS[settings.paddle] || PADDLE_WIDTHS.orta;
  game.paddle.x = clamp(game.paddle.x, 0, fieldW - game.paddle.w);
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/* ===================== Level layout ===================== */

function layoutForField() {
  const lvl = game.level;
  const top = 46;
  const availH = fieldH * 0.33;
  const bw = fieldW / lvl.cols;
  const bh = availH / lvl.rows;
  game.brickSize = { w: bw, h: bh, top };
  game.bricks.forEach((b) => {
    b.x = b.col * bw;
    b.y = top + b.row * bh;
    b.w = bw;
    b.h = bh;
  });
  game.paddle.y = fieldH - 34;
  resizePaddleForSetting();
}

function buildBricks(lvl) {
  const bricks = [];
  for (let r = 0; r < lvl.rows; r++) {
    for (let c = 0; c < lvl.cols; c++) {
      const type = lvl.grid[r] ? lvl.grid[r][c] : 0;
      if (!type) continue;
      bricks.push({ row: r, col: c, type, hp: type === 2 ? 2 : 1, alive: true, x: 0, y: 0, w: 0, h: 0, flash: 0 });
    }
  }
  return bricks;
}

/* ===================== Ball helpers ===================== */

function makeBall(x, y, angleDeg, speed) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x, y, r: 7,
    vx: Math.sin(rad) * speed,
    vy: -Math.cos(rad) * speed,
    speed,
    trail: [],
    flatTimer: 0,
  };
}

function launchAllBalls() {
  game.ballLaunched = true;
  game.balls.forEach((b) => {
    if (b.vx === 0 && b.vy === 0) {
      const speed = currentBallSpeed();
      const angle = (Math.random() * 40) - 20;
      const rad = (angle * Math.PI) / 180;
      b.vx = Math.sin(rad) * speed;
      b.vy = -Math.cos(rad) * speed;
    }
  });
  updateTouchHint();
}

const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

function updateTouchHint() {
  const hint = document.querySelector('.touch-hint');
  if (!hint) return;
  if (game.ballLaunched) {
    hint.hidden = true;
    return;
  }
  hint.textContent = isCoarsePointer
    ? 'Dokun ve sürükleyerek raketi hareket ettir. Başlatmak için dokun.'
    : 'Başlatmak için tıkla.';
  hint.hidden = false;
}

function currentBallSpeed() {
  const base = BASE_BALL_SPEED * difficultyConf().speedMult * game.level.speed;
  const rampBonus = 1 + (1 - aliveBrickRatio()) * 0.35;
  const slow = game.activeEffects.yavas ? 0.6 : 1;
  return base * rampBonus * slow;
}

function aliveBrickRatio() {
  const total = game.bricks.length || 1;
  const alive = game.bricks.filter((b) => b.alive).length;
  return alive / total;
}

/* ===================== Start / reset ===================== */

function startGame(levelIndex) {
  game.levelIndex = levelIndex;
  game.level = levels[levelIndex];
  game.score = 0;
  game.lives = difficultyConf().lives;
  game.combo = 0;
  game.livesLostThisLevel = 0;
  game.powerupTypesThisRound = [];
  game.particles = [];
  game.powerups = [];
  game.activeEffects = {};
  game.shake = 0;
  game.flash = 0;
  game.bricks = buildBricks(game.level);
  document.getElementById('game-over-banner').classList.add('hidden');
  document.getElementById('level-clear-banner').classList.add('hidden');
  document.getElementById('pause-menu').classList.add('hidden');
  showScreen('game');
  fitCanvas();
  resizePaddleForSetting();
  game.paddle.x = (fieldW - game.paddle.w) / 2;
  layoutForField();
  resetBallOnPaddle();
  updateHUD();
  renderPowerupChips();
  game.running = true;
  game.paused = false;
  game.countdown = 0;
  game.accumulator = 0;
  game.lastTime = performance.now();
  if (!game.frameHandle) game.frameHandle = requestAnimationFrame(loop);
}

function resetBallOnPaddle() {
  const speed = currentBallSpeed();
  const b = makeBall(game.paddle.x + game.paddle.w / 2, game.paddle.y - 10, 0, speed);
  b.vx = 0; b.vy = 0;
  game.balls = [b];
  game.ballLaunched = false;
  updateTouchHint();
}

/* ===================== HUD ===================== */

function updateHUD() {
  document.getElementById('hud-score').textContent = game.score;
  document.getElementById('hud-lives').textContent = game.lives;
  document.getElementById('hud-level').textContent = game.levelIndex + 1;
  const comboEl = document.getElementById('hud-combo');
  if (game.combo > 1) {
    comboEl.textContent = `KOMBO x${game.combo}`;
    comboEl.style.fontSize = `${Math.min(30, 14 + game.combo * 1.4)}px`;
  } else {
    comboEl.textContent = '';
  }
}

function renderPowerupChips() {
  const wrap = document.getElementById('powerup-chips');
  wrap.innerHTML = Object.entries(game.activeEffects).map(([type, eff]) => `
    <div class="powerup-chip" data-type="${type}">
      <div class="fill" style="width:${(eff.remaining / eff.total) * 100}%"></div>
      <span>${POWERUP_LABELS[type]} ${Math.ceil(eff.remaining)}s</span>
    </div>`).join('');
}

/* ===================== Input ===================== */

function paddleFromClientX(clientX) {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  game.paddle.x = clamp(x - game.paddle.w / 2, 0, fieldW - game.paddle.w);
}

canvas.addEventListener('mousemove', (e) => { if (game.running && !game.paused) paddleFromClientX(e.clientX); });
canvas.addEventListener('mousedown', () => { if (game.running && !game.paused) launchAllBalls(); });

canvas.addEventListener('touchmove', (e) => {
  if (game.running && !game.paused && e.touches.length) paddleFromClientX(e.touches[0].clientX);
  e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchstart', (e) => {
  if (game.running && !game.paused) {
    if (e.touches.length) paddleFromClientX(e.touches[0].clientX);
    launchAllBalls();
  }
  e.preventDefault();
}, { passive: false });

const keys = {};
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { e.preventDefault(); if (game.running) togglePause(); }
  if (e.code === 'Escape') { if (game.running && !game.paused) togglePause(); }
  keys[e.code] = true;
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

function handleKeyboardPaddle(dt) {
  const speed = 480;
  if (keys.ArrowLeft) game.paddle.x -= speed * dt;
  if (keys.ArrowRight) game.paddle.x += speed * dt;
  if (keys.ArrowLeft || keys.ArrowRight) game.paddle.x = clamp(game.paddle.x, 0, fieldW - game.paddle.w);
}
window.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowUp' && game.running && !game.paused && !game.ballLaunched) launchAllBalls();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.running && !game.paused) togglePause(true);
});

/* ===================== Pause ===================== */

function pauseIfRunning() { if (game.running && !game.paused) togglePause(true); }

function togglePause(forcePause) {
  if (forcePause === true && game.paused) return;
  game.paused = !game.paused;
  document.getElementById('pause-menu').classList.toggle('hidden', !game.paused);
  if (!game.paused) startCountdown();
}

function startCountdown() {
  game.countdown = 3;
}

document.getElementById('btn-pause').addEventListener('click', () => { if (game.running) togglePause(); });
document.getElementById('btn-resume').addEventListener('click', () => togglePause());
document.getElementById('btn-restart').addEventListener('click', () => startGame(game.levelIndex));
document.getElementById('btn-pause-settings').addEventListener('click', () => showScreen('settings'));
document.getElementById('btn-next-level').addEventListener('click', () => {
  const next = game.levelIndex + 1;
  if (next < levels.length) startGame(next); else showScreen('start');
});
document.getElementById('btn-again').addEventListener('click', () => startGame(game.levelIndex));
document.getElementById('btn-to-scores').addEventListener('click', () => showScreen('scores'));

/* ===================== Collision: swept circle vs rect ===================== */

function sweptCircleRect(ox, oy, nx, ny, radius, rect) {
  const left = rect.x - radius, right = rect.x + rect.w + radius;
  const top = rect.y - radius, bottom = rect.y + rect.h + radius;
  const dx = nx - ox, dy = ny - oy;
  let tmin = 0, tmax = 1;
  let normal = null;

  if (Math.abs(dx) < 1e-9) {
    if (ox < left || ox > right) return null;
  } else {
    let t1 = (left - ox) / dx, t2 = (right - ox) / dx;
    let n1 = -1, n2 = 1;
    if (t1 > t2) { [t1, t2] = [t2, t1]; [n1, n2] = [n2, n1]; }
    if (t1 > tmin) { tmin = t1; normal = { x: n1, y: 0 }; }
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return null;
  }

  if (Math.abs(dy) < 1e-9) {
    if (oy < top || oy > bottom) return null;
  } else {
    let t1 = (top - oy) / dy, t2 = (bottom - oy) / dy;
    let n1 = -1, n2 = 1;
    if (t1 > t2) { [t1, t2] = [t2, t1]; [n1, n2] = [n2, n1]; }
    if (t1 > tmin) { tmin = t1; normal = { x: 0, y: n1 }; }
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return null;
  }

  if (tmin < 0 || tmin > 1) return null;
  if (!normal) return null;
  return { t: tmin, normal };
}

/* ===================== Update ===================== */

function stepBall(ball, dt) {
  let remaining = dt;
  let iterations = 0;
  while (remaining > 1e-6 && iterations < 4) {
    iterations++;
    const ox = ball.x, oy = ball.y;
    const nx = ox + ball.vx * remaining, ny = oy + ball.vy * remaining;

    let best = null;
    let bestTarget = null;

    const wallHit = wallCollision(ox, oy, nx, ny, ball.r);
    if (wallHit) { best = wallHit; bestTarget = 'wall'; }

    const paddleRect = { x: game.paddle.x, y: game.paddle.y, w: game.paddle.w, h: game.paddle.h };
    const ph = sweptCircleRect(ox, oy, nx, ny, ball.r, paddleRect);
    if (ph && (!best || ph.t < best.t)) { best = ph; bestTarget = 'paddle'; }

    let hitBrick = null;
    for (const brick of game.bricks) {
      if (!brick.alive) continue;
      const bh = sweptCircleRect(ox, oy, nx, ny, ball.r, brick);
      if (bh && (!best || bh.t < best.t)) { best = bh; bestTarget = 'brick'; hitBrick = brick; }
    }

    if (!best) {
      ball.x = nx; ball.y = ny;
      break;
    }

    ball.x = ox + (nx - ox) * best.t;
    ball.y = oy + (ny - oy) * best.t;

    if (best.normal.x !== 0) ball.vx = -ball.vx;
    if (best.normal.y !== 0) ball.vy = -ball.vy;

    if (bestTarget === 'paddle') {
      const hitPos = clamp((ball.x - (game.paddle.x + game.paddle.w / 2)) / (game.paddle.w / 2), -1, 1);
      const maxAngle = 60 * (Math.PI / 180);
      const angle = hitPos * maxAngle;
      const speed = Math.hypot(ball.vx, ball.vy) || currentBallSpeed();
      ball.vx = Math.sin(angle) * speed;
      ball.vy = -Math.abs(Math.cos(angle) * speed);
      sfxPaddle();
    } else if (bestTarget === 'brick') {
      onBrickHit(hitBrick);
    }

    remaining = remaining * (1 - best.t);
  }

  ball.x = clamp(ball.x, ball.r, fieldW - ball.r);
  ball.y = Math.max(ball.y, ball.r);

  const speedNow = Math.hypot(ball.vx, ball.vy);
  if (speedNow > 1) {
    const vertRatio = Math.abs(ball.vy) / speedNow;
    if (vertRatio < 0.18) {
      ball.flatTimer += dt;
      if (ball.flatTimer > 1.2) {
        const sign = ball.vy >= 0 ? 1 : -1;
        const nudgeAngle = 28 * (Math.PI / 180);
        const dir = ball.vx >= 0 ? 1 : -1;
        ball.vx = Math.sin(nudgeAngle) * speedNow * dir;
        ball.vy = sign * Math.cos(nudgeAngle) * speedNow;
        ball.flatTimer = 0;
      }
    } else {
      ball.flatTimer = 0;
    }
  }

  ball.trail.push({ x: ball.x, y: ball.y });
  if (ball.trail.length > 8) ball.trail.shift();
}

function wallCollision(ox, oy, nx, ny, r) {
  let best = null;
  if (nx - r < 0 && nx < ox) {
    const t = clamp((r - ox) / (nx - ox), 0, 1);
    best = { t, normal: { x: 1, y: 0 } };
  } else if (nx + r > fieldW && nx > ox) {
    const t = clamp((fieldW - r - ox) / (nx - ox), 0, 1);
    best = { t, normal: { x: -1, y: 0 } };
  }
  if (ny - r < 0 && ny < oy) {
    const t = clamp((r - oy) / (ny - oy), 0, 1);
    if (!best || t < best.t) best = { t, normal: { x: 0, y: 1 } };
  }
  return best;
}

function onBrickHit(brick) {
  brick.hp -= 1;
  if (brick.type === 3) {
    brick.flash = 0.25;
    sfxBrick(brick.row);
    return;
  }
  sfxBrick(brick.row);
  if (brick.hp <= 0) {
    brick.alive = false;
    game.combo += 1;
    const gain = 10 * (brick.type === 2 ? 2 : 1) * Math.max(1, Math.floor(game.combo / 3));
    game.score += gain;
    spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, brickColor(brick));
    maybeDropPowerup(brick);
    if (game.combo >= 10) grantAchievement('kombo-10');
    if (game.score >= 5000) grantAchievement('bes-bin');
    checkLevelClear();
  } else {
    brick.flash = 0.2;
  }
  updateHUD();
}

function brickColor(brick) {
  if (brick.type === 3) return cssVar('--text-dim') || '#888';
  const palette = [cssVar('--accent'), cssVar('--accent-2'), cssVar('--accent-3')];
  return palette[brick.row % palette.length] || cssVar('--accent');
}

function maybeDropPowerup(brick) {
  if (Math.random() > 1 / 6) return;
  const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  game.powerups.push({ x: brick.x + brick.w / 2, y: brick.y + brick.h / 2, vy: 90, type, r: 9 });
}

function checkLevelClear() {
  const remaining = game.bricks.some((b) => b.alive && b.type !== 3);
  if (!remaining) onLevelClear();
}

function spawnParticles(x, y, color) {
  for (let i = 0; i < 14; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 140;
    game.particles.push({
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 0.4 + Math.random() * 0.3, age: 0, color,
    });
  }
}

function updateParticles(dt) {
  game.particles.forEach((p) => { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 220 * dt; });
  game.particles = game.particles.filter((p) => p.age < p.life);
}

function updatePowerups(dt) {
  game.powerups.forEach((p) => { p.y += p.vy * dt; });
  const paddleRect = { x: game.paddle.x, y: game.paddle.y, w: game.paddle.w, h: game.paddle.h };
  game.powerups = game.powerups.filter((p) => {
    if (p.y - p.r > fieldH) return false;
    const inX = p.x > paddleRect.x - p.r && p.x < paddleRect.x + paddleRect.w + p.r;
    const inY = p.y + p.r > paddleRect.y && p.y - p.r < paddleRect.y + paddleRect.h;
    if (inX && inY) { catchPowerup(p.type); return false; }
    return true;
  });
}

function catchPowerup(type) {
  sfxPowerup();
  progress.powerupsCollected = (progress.powerupsCollected || 0) + 1;
  saveProgress(progress);
  if (!game.powerupTypesThisRound.includes(type)) game.powerupTypesThisRound.push(type);
  if (game.powerupTypesThisRound.length >= POWERUP_TYPES.length) grantAchievement('guc-toplayici');

  if (type === 'can') {
    game.lives = Math.min(9, game.lives + 1);
    updateHUD();
    showToast('Ekstra can!');
    return;
  }

  const durations = { coklu: 12, genis: 14, yavas: 10 };
  const total = durations[type];
  game.activeEffects[type] = { remaining: total, total };

  if (type === 'coklu') splitBalls();
  if (type === 'genis') { game.paddle.w = PADDLE_WIDTHS[settings.paddle] * 1.5; }
  if (type === 'yavas') retargetBallSpeed();

  renderPowerupChips();
}

// Balls keep their speed across bounces, so a speed effect has to rescale them
// when it starts and when it ends, or nothing visible happens.
function retargetBallSpeed() {
  const target = currentBallSpeed();
  game.balls.forEach((ball) => {
    const speed = Math.hypot(ball.vx, ball.vy);
    if (speed < 1) return;
    ball.vx = (ball.vx / speed) * target;
    ball.vy = (ball.vy / speed) * target;
  });
}

function splitBalls() {
  const base = game.balls[0];
  if (!base) return;
  const speed = Math.hypot(base.vx, base.vy) || currentBallSpeed();
  const baseAngle = Math.atan2(base.vx, -base.vy);
  [-0.35, 0.35].forEach((offset) => {
    const angle = baseAngle + offset;
    const clone = makeBall(base.x, base.y, 0, speed);
    clone.vx = Math.sin(angle) * speed;
    clone.vy = -Math.cos(angle) * speed;
    game.balls.push(clone);
  });
}

function updateActiveEffects(dt) {
  let changed = false;
  for (const [type, eff] of Object.entries(game.activeEffects)) {
    eff.remaining -= dt;
    if (eff.remaining <= 0) {
      delete game.activeEffects[type];
      if (type === 'genis') game.paddle.w = PADDLE_WIDTHS[settings.paddle];
      if (type === 'coklu' && game.balls.length > 1) game.balls.length = 1;
      if (type === 'yavas') retargetBallSpeed();
      changed = true;
    }
  }
  if (changed || Object.keys(game.activeEffects).length) renderPowerupChips();
}

function loseLife() {
  game.lives -= 1;
  game.livesLostThisLevel += 1;
  game.combo = 0;
  game.shake = 0.4;
  sfxLifeLost();
  updateHUD();
  if (game.lives <= 0) {
    onGameOver();
  } else {
    game.paddle.w = PADDLE_WIDTHS[settings.paddle];
    game.activeEffects = {};
    renderPowerupChips();
    resetBallOnPaddle();
    game.paddle.x = (fieldW - game.paddle.w) / 2;
  }
}

async function onGameOver() {
  game.running = false;
  document.getElementById('game-over-score').textContent = `Skor: ${game.score}`;
  document.getElementById('game-over-banner').classList.remove('hidden');
  const rank = await postScore(game.score, game.levelIndex + 1);
  document.getElementById('game-over-rank').textContent = rank ? `Sıralama: #${rank}` : 'Skor kaydedilemedi (bağlantı yok)';
}

function onLevelClear() {
  game.running = false;
  game.flash = 0.5;
  sfxLevelClear();
  if (game.levelIndex === 0) grantAchievement('ilk-bolum');
  if (game.livesLostThisLevel === 0) grantAchievement('kayipsiz');
  if (progress.unlocked <= game.levelIndex + 1 && game.levelIndex + 1 < levels.length) {
    progress.unlocked = game.levelIndex + 2;
    saveProgress(progress);
  } else if (game.levelIndex + 1 >= levels.length) {
    saveProgress(progress);
  }
  document.getElementById('level-clear-title').textContent = game.levelIndex + 1 >= levels.length ? 'Tüm bölümler tamamlandı!' : 'Bölüm tamamlandı';
  document.getElementById('level-clear-score').textContent = `Skor: ${game.score}`;
  document.getElementById('btn-next-level').classList.toggle('hidden', game.levelIndex + 1 >= levels.length);
  document.getElementById('level-clear-banner').classList.remove('hidden');
  renderLevelGrid();
}

/* ===================== Main update / render ===================== */

function update(dt) {
  if (game.countdown > 0) {
    game.countdown -= dt;
    return;
  }
  handleKeyboardPaddle(dt);
  updateActiveEffects(dt);

  game.balls.forEach((b) => { if (game.ballLaunched) stepBall(b, dt); else { b.x = game.paddle.x + game.paddle.w / 2; b.y = game.paddle.y - 10; } });

  game.balls = game.balls.filter((b) => b.y - b.r < fieldH + 40);
  if (game.balls.length === 0 && game.ballLaunched) {
    loseLife();
  }

  updatePowerups(dt);
  updateParticles(dt);

  game.bricks.forEach((b) => { if (b.flash > 0) b.flash -= dt; });
  if (game.shake > 0) game.shake = Math.max(0, game.shake - dt * 2);
  if (game.flash > 0) game.flash = Math.max(0, game.flash - dt * 1.5);
}

function render() {
  ctx.save();
  if (game.shake > 0) {
    const mag = game.shake * 6;
    ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
  }

  ctx.fillStyle = cssVar('--bg') || '#070713';
  ctx.fillRect(-10, -10, fieldW + 20, fieldH + 20);

  for (const brick of game.bricks) {
    if (!brick.alive) continue;
    drawBrick(brick);
  }

  for (const p of game.powerups) drawPowerup(p);
  for (const p of game.particles) drawParticle(p);

  const paddleColor = cssVar('--accent') || '#0ff';
  ctx.fillStyle = paddleColor;
  ctx.shadowColor = paddleColor;
  ctx.shadowBlur = 10;
  roundRect(game.paddle.x, game.paddle.y, game.paddle.w, game.paddle.h, 6);
  ctx.fill();
  ctx.shadowBlur = 0;

  for (const b of game.balls) drawBall(b);

  if (game.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${game.flash * 0.5})`;
    ctx.fillRect(-10, -10, fieldW + 20, fieldH + 20);
  }

  ctx.restore();

  if (game.countdown > 0) drawCountdown();
}

function drawBrick(brick) {
  const isUnbreak = brick.type === 3;
  const color = brickColor(brick);
  ctx.save();
  if (brick.flash > 0) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
  }
  ctx.fillStyle = color;
  ctx.globalAlpha = isUnbreak ? 0.85 : 1;
  roundRect(brick.x + 2, brick.y + 2, brick.w - 4, brick.h - 4, 3);
  ctx.fill();
  ctx.globalAlpha = 1;

  if (isUnbreak) {
    ctx.strokeStyle = cssVar('--accent-3') || '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(brick.x + 3, brick.y + 3, brick.w - 6, brick.h - 6);
  } else if (brick.type === 2 && brick.hp === 1) {
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(brick.x + brick.w * 0.3, brick.y + 2);
    ctx.lineTo(brick.x + brick.w * 0.55, brick.y + brick.h * 0.6);
    ctx.lineTo(brick.x + brick.w * 0.4, brick.y + brick.h - 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBall(ball) {
  ball.trail.forEach((t, i) => {
    const alpha = (i / ball.trail.length) * 0.25;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath();
    ctx.arc(t.x, t.y, ball.r * 0.7, 0, Math.PI * 2);
    ctx.fill();
  });
  const color = cssVar('--accent') || '#0ff';
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawPowerup(p) {
  const colors = { coklu: cssVar('--accent'), genis: cssVar('--accent-2'), yavas: cssVar('--accent-3'), can: cssVar('--success') };
  ctx.fillStyle = colors[p.type] || '#fff';
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fill();
}

function drawParticle(p) {
  const alpha = 1 - p.age / p.life;
  ctx.fillStyle = p.color;
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.beginPath();
  ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawCountdown() {
  ctx.save();
  ctx.fillStyle = 'rgba(4,4,12,0.4)';
  ctx.fillRect(0, 0, fieldW, fieldH);
  ctx.fillStyle = cssVar('--accent') || '#0ff';
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const n = Math.ceil(game.countdown);
  ctx.fillText(String(n > 0 ? n : ''), fieldW / 2, fieldH / 2);
  ctx.restore();
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ===================== Loop ===================== */

function loop(now) {
  game.frameHandle = requestAnimationFrame(loop);
  if (!game.running || game.paused || document.hidden) { game.lastTime = now; return; }
  let frameDt = (now - game.lastTime) / 1000;
  game.lastTime = now;
  frameDt = Math.min(frameDt, 0.05);
  game.accumulator += frameDt;
  while (game.accumulator >= FIXED_DT) {
    update(FIXED_DT);
    game.accumulator -= FIXED_DT;
  }
  render();
  updateHUD();
}

/* ===================== Boot ===================== */

renderSettingsUI();
loadLevels();
loadAchievementDefs();
showScreen('start');
updateTouchHint();
requestAnimationFrame(() => { booted = true; });
