'use strict';

/* =========================================================================
   NEON BREAKER - client game
   Sections: config, audio, state, level loading, input, physics, powerups,
   particles, rendering, HUD/UI, screens, leaderboard, debug hooks, boot.
   ========================================================================= */

/* ---------------------------------------------------------------------
   1. CONFIG
   --------------------------------------------------------------------- */
const FIELD_W = 880;
const FIELD_H = 620;
const BALL_R = 8;
const PADDLE_H = 16;
const PADDLE_Y = FIELD_H - 34;
const PADDLE_SPEED = 9; // px per fixed tick, keyboard movement
const FIXED_DT = 1000 / 60; // ms per physics tick
const MAX_BOUNCE_ANGLE = Math.PI / 3; // 60 degrees from vertical
const BRICK_TOP = 64;
const BRICK_SIDE = 24;
const BRICK_GAP = 6;
const BRICK_FIELD_BOTTOM = FIELD_H * 0.6; // brick block may fill the field down to here
const POWERUP_DURATION = 10; // seconds, for wide/slow
const POWERUP_DROP_CHANCE = 1 / 8;
const POWERUP_TYPES = ['multi', 'wide', 'slow', 'life'];
const POWERUP_LABELS = { multi: 'Çoklu Top', wide: 'Geniş Raket', slow: 'Yavaş Top', life: 'Ekstra Can' };

/* ---------------------------------------------------------------------
   2. AUDIO (synthesized, created on first user gesture)
   --------------------------------------------------------------------- */
const Audio_ = (() => {
  let ctx = null;
  let muted = localStorage.getItem('nb_muted') === '1';

  function ensure() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  }

  function tone(freq, dur, type, gainPeak) {
    if (muted || !ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(gainPeak || 0.15, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur + 0.02);
    } catch (e) { /* audio unavailable, stay silent */ }
  }

  return {
    init: ensure,
    isMuted: () => muted,
    setMuted(v) {
      muted = v;
      localStorage.setItem('nb_muted', v ? '1' : '0');
    },
    paddle() { tone(220, 0.08, 'square', 0.12); },
    brick(row) { tone(440 + Math.max(0, (5 - row)) * 90, 0.1, 'triangle', 0.14); },
    powerup() { tone(660, 0.14, 'sine', 0.16); setTimeout(() => tone(880, 0.14, 'sine', 0.14), 80); },
    life() { tone(120, 0.25, 'sawtooth', 0.18); },
    fanfare() {
      [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.18, 'triangle', 0.16), i * 90));
    },
  };
})();

/* ---------------------------------------------------------------------
   3. STATE
   --------------------------------------------------------------------- */
const state = {
  phase: 'menu', // menu | countdown | playing | paused | transition | gameover
  levels: [],
  levelIndex: 1,
  level: null,
  bricks: [],
  balls: [],
  paddle: { x: FIELD_W / 2 - 60, w: 120, baseW: 120 },
  lives: 3,
  score: 0,
  displayScore: 0,
  combo: 0,
  drops: [],
  activePowerUps: {}, // type -> remaining seconds (wide, slow)
  particles: [],
  shake: 0,
  muted: Audio_.isMuted(),
  levelElapsed: 0,
  win: false,
  autoplay: false,
  countdownValue: 0,
  countdownNextTick: 0,
  transitionUntil: 0,
  input: { left: false, right: false },
  freshScoreId: null,
};

/* ---------------------------------------------------------------------
   4. LEVEL LOADING
   --------------------------------------------------------------------- */
function generateFallbackLevels() {
  const palettes = [
    { bg: '#070312', grid: '#1b1140', brick: ['#ff2d95', '#00e6ff', '#7cff5a', '#ffd23f'], accent: '#00e6ff' },
    { bg: '#050414', grid: '#171236', brick: ['#00e6ff', '#7cff5a', '#ff2d95', '#c86bff'], accent: '#7cff5a' },
    { bg: '#0a0210', grid: '#221030', brick: ['#ffd23f', '#ff2d95', '#00e6ff', '#ff6a3f'], accent: '#ff2d95' },
    { bg: '#020310', grid: '#111a3a', brick: ['#c86bff', '#00e6ff', '#ffd23f', '#7cff5a'], accent: '#c86bff' },
    { bg: '#04020c', grid: '#241040', brick: ['#ff2d95', '#ffd23f', '#7cff5a', '#00e6ff'], accent: '#ffd23f' },
  ];
  const rows = 6, cols = 11;
  const patterns = [
    (r, c) => (r >= 1 && r <= 2 ? (c % 5 === 0 ? 't' : 'n') : '.'),
    (r, c) => (r + c) % 3 === 0 ? 'n' : ((r === 2 && c === 5) ? 'x' : '.'),
    (r, c) => (r < 4 && (c < 2 || c > 8)) ? 'n' : (r === 1 ? 't' : '.'),
    (r, c) => (Math.abs(c - 5) <= (5 - r) && r < 5) ? (r === 0 ? 'x' : 'n') : '.',
    (r, c) => (r % 2 === 0 ? (c % 2 === 0 ? 't' : 'n') : (c === 0 || c === cols - 1 ? 'x' : '.')),
  ];
  const names = ['Başlangıç', 'Ayna', 'Kanatlar', 'Piramit', 'Son Direniş'];
  const levels = [];
  for (let i = 0; i < 5; i++) {
    const grid = [];
    for (let r = 0; r < rows; r++) {
      let row = '';
      for (let c = 0; c < cols; c++) row += patterns[i](r, c);
      grid.push(row);
    }
    levels.push({
      index: i + 1,
      name: names[i],
      palette: palettes[i],
      ballSpeed: 3.6 + i * 0.55,
      paddleWidth: 120 - i * 6,
      rows, cols, grid,
    });
  }
  return levels;
}

async function loadLevels() {
  try {
    const res = await fetch('/api/levels');
    if (!res.ok) throw new Error('bad status');
    const data = await res.json();
    if (data && data.ok && Array.isArray(data.levels) && data.levels.length === 5) {
      state.levels = data.levels;
      return;
    }
    throw new Error('bad shape');
  } catch (e) {
    state.levels = generateFallbackLevels();
  }
}

function buildLevel(levelIndex) {
  const def = state.levels[levelIndex - 1] || state.levels[0];
  state.level = def;
  state.bricks = [];
  const brickW = (FIELD_W - 2 * BRICK_SIDE - (def.cols - 1) * BRICK_GAP) / def.cols;
  const usableH = BRICK_FIELD_BOTTOM - BRICK_TOP - (def.rows - 1) * BRICK_GAP;
  const brickH = clamp(usableH / def.rows, 20, 38);
  for (let r = 0; r < def.rows; r++) {
    const rowStr = def.grid[r] || '';
    for (let c = 0; c < def.cols; c++) {
      const ch = rowStr[c] || '.';
      if (ch === '.') continue;
      const hp = ch === 't' ? 2 : (ch === 'x' ? Infinity : 1);
      state.bricks.push({
        row: r, col: c,
        x: BRICK_SIDE + c * (brickW + BRICK_GAP),
        y: BRICK_TOP + r * (brickH + BRICK_GAP),
        w: brickW, h: brickH,
        type: ch, hp, alive: true,
        color: def.palette.brick[r % def.palette.brick.length],
      });
    }
  }
  state.paddle.baseW = def.paddleWidth;
  state.paddle.w = def.paddleWidth;
  state.paddle.x = FIELD_W / 2 - def.paddleWidth / 2;
  state.levelElapsed = 0;
  state.drops = [];
  state.activePowerUps = {};
  state.combo = 0;
  resetBall();
}

function resetBall() {
  state.balls = [{
    x: state.paddle.x + state.paddle.w / 2,
    y: PADDLE_Y - BALL_R - 2,
    vx: 0, vy: 0,
    r: BALL_R,
    launched: false,
    trail: [],
    flatCounter: 0,
    vertCounter: 0,
  }];
}

/* ---------------------------------------------------------------------
   5. INPUT
   --------------------------------------------------------------------- */
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function canvasPointFromEvent(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = FIELD_W / rect.width;
  const scaleY = FIELD_H / rect.height;
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

function movePaddleTo(logicalX) {
  if (state.autoplay) return;
  state.paddle.x = clamp(logicalX - state.paddle.w / 2, 0, FIELD_W - state.paddle.w);
}

canvas.addEventListener('mousemove', (e) => {
  const p = canvasPointFromEvent(e.clientX, e.clientY);
  movePaddleTo(p.x);
});

canvas.addEventListener('mousedown', () => { Audio_.init(); launchWaitingBalls(); });

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  Audio_.init();
  const t = e.touches[0];
  if (t) movePaddleTo(canvasPointFromEvent(t.clientX, t.clientY).x);
  launchWaitingBalls();
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const t = e.touches[0];
  if (t) movePaddleTo(canvasPointFromEvent(t.clientX, t.clientY).x);
}, { passive: false });

function launchWaitingBalls() {
  if (state.phase !== 'playing') return;
  let launched = false;
  for (const b of state.balls) {
    if (!b.launched) {
      const speed = currentBallSpeed();
      const angle = (Math.random() * 0.4 - 0.2);
      b.vx = speed * Math.sin(angle);
      b.vy = -speed * Math.cos(angle);
      b.launched = true;
      launched = true;
    }
  }
  if (launched && !state.autoplay) Audio_.init();
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') state.input.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') state.input.right = true;
  if (e.code === 'Space') {
    e.preventDefault();
    Audio_.init();
    if (state.phase === 'playing') {
      const hasWaiting = state.balls.some((b) => !b.launched);
      if (hasWaiting) launchWaitingBalls();
      else togglePauseKey();
    } else if (state.phase === 'paused') {
      togglePauseKey();
    }
  }
  if (e.key === 'Escape') {
    if (state.phase === 'playing' || state.phase === 'paused') togglePauseKey();
  }
  if (e.key === 'm' || e.key === 'M') toggleMute();
  if (e.key === 'Enter' && state.phase === 'gameover') {
    const form = document.getElementById('scoreForm');
    if (form && document.activeElement !== document.getElementById('nameInput')) {
      form.requestSubmit();
    }
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') state.input.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') state.input.right = false;
});

function togglePauseKey() {
  if (state.phase === 'playing') {
    state.phase = 'paused';
    setScreen('pauseScreen');
    document.getElementById('countdownText').classList.add('hidden');
    document.querySelector('#pauseScreen h2').classList.remove('hidden');
    document.querySelector('#pauseScreen .hint').classList.remove('hidden');
    document.getElementById('stage').classList.add('blurred');
  } else if (state.phase === 'paused') {
    state.phase = 'countdown';
    state.countdownValue = 3;
    state.countdownNextTick = performance.now() + 1000;
    document.querySelector('#pauseScreen h2').classList.add('hidden');
    document.querySelector('#pauseScreen .hint').classList.add('hidden');
    const ct = document.getElementById('countdownText');
    ct.classList.remove('hidden');
    ct.textContent = '3';
  }
}

/* ---------------------------------------------------------------------
   6. PHYSICS HELPERS
   --------------------------------------------------------------------- */
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function currentBallSpeed() {
  const base = state.level ? state.level.ballSpeed : 4;
  const creep = Math.min(0.35, state.levelElapsed * 0.01);
  const slow = state.activePowerUps.slow ? 0.6 : 1;
  return base * (1 + creep) * slow;
}

// Swept circle vs rectangle using a Minkowski-expanded AABB ray test.
function sweptCircleRect(x0, y0, x1, y1, r, rect) {
  const ex0 = rect.x - r, ey0 = rect.y - r, ex1 = rect.x + rect.w + r, ey1 = rect.y + rect.h + r;
  const dx = x1 - x0, dy = y1 - y0;
  let tmin = 0, tmax = 1, nx = 0, ny = 0;

  if (dx === 0) {
    if (x0 < ex0 || x0 > ex1) return null;
  } else {
    let tx1 = (ex0 - x0) / dx, tx2 = (ex1 - x0) / dx, sx = -1;
    if (tx1 > tx2) { const tmp = tx1; tx1 = tx2; tx2 = tmp; sx = 1; }
    if (tx1 > tmin) { tmin = tx1; nx = sx; ny = 0; }
    if (tx2 < tmax) tmax = tx2;
    if (tmin > tmax) return null;
  }

  if (dy === 0) {
    if (y0 < ey0 || y0 > ey1) return null;
  } else {
    let ty1 = (ey0 - y0) / dy, ty2 = (ey1 - y0) / dy, sy = -1;
    if (ty1 > ty2) { const tmp = ty1; ty1 = ty2; ty2 = tmp; sy = 1; }
    if (ty1 > tmin) { tmin = ty1; nx = 0; ny = sy; }
    if (ty2 < tmax) tmax = ty2;
    if (tmin > tmax) return null;
  }

  if (tmin < 0 || tmin > 1) return null;
  return { t: tmin, nx, ny };
}

// Detect and correct near-horizontal or near-vertical infinite loops.
function normalizeAngle(ball, speed) {
  if (speed <= 0) return;
  if (Math.abs(ball.vy) < speed * 0.18) {
    ball.flatCounter++;
    if (ball.flatCounter > 40) {
      const sign = ball.vy >= 0 ? 1 : -1;
      ball.vy = sign * speed * 0.4;
      ball.flatCounter = 0;
    }
  } else {
    ball.flatCounter = 0;
  }
  if (Math.abs(ball.vx) < speed * 0.1) {
    ball.vertCounter++;
    if (ball.vertCounter > 60) {
      const sign = ball.vx >= 0 ? 1 : -1;
      ball.vx = (sign || 1) * speed * 0.3;
      ball.vertCounter = 0;
    }
  } else {
    ball.vertCounter = 0;
  }
  const mag = Math.hypot(ball.vx, ball.vy) || 1;
  ball.vx = (ball.vx / mag) * speed;
  ball.vy = (ball.vy / mag) * speed;
}

/* ---------------------------------------------------------------------
   7. MAIN PHYSICS STEP (fixed timestep)
   --------------------------------------------------------------------- */
function updatePhysics(dtSec) {
  if (!state.level) return;

  // paddle movement
  if (!state.autoplay) {
    if (state.input.left) state.paddle.x -= PADDLE_SPEED;
    if (state.input.right) state.paddle.x += PADDLE_SPEED;
    state.paddle.x = clamp(state.paddle.x, 0, FIELD_W - state.paddle.w);
  } else {
    autopilotStep();
  }
  state.paddle.w = state.activePowerUps.wide ? state.paddle.baseW * 1.5 : state.paddle.baseW;
  state.paddle.x = clamp(state.paddle.x, 0, FIELD_W - state.paddle.w);

  state.levelElapsed += dtSec;

  // countdown chips tick down
  for (const type of Object.keys(state.activePowerUps)) {
    state.activePowerUps[type] -= dtSec;
    if (state.activePowerUps[type] <= 0) delete state.activePowerUps[type];
  }

  const speed = currentBallSpeed();
  const paddleRect = { x: state.paddle.x, y: PADDLE_Y, w: state.paddle.w, h: PADDLE_H };

  for (let bi = state.balls.length - 1; bi >= 0; bi--) {
    const ball = state.balls[bi];
    if (!ball.launched) {
      ball.x = state.paddle.x + state.paddle.w / 2;
      ball.y = PADDLE_Y - ball.r - 2;
      continue;
    }

    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 14) ball.trail.shift();

    normalizeAngle(ball, speed);

    const travel = Math.hypot(ball.vx, ball.vy);
    const substeps = Math.max(1, Math.ceil(travel / (ball.r * 0.5)));
    const stepVx = ball.vx / substeps;
    const stepVy = ball.vy / substeps;
    let lost = false;

    for (let s = 0; s < substeps && !lost; s++) {
      let x0 = ball.x, y0 = ball.y;
      let x1 = x0 + stepVx, y1 = y0 + stepVy;

      // left / right / top walls (simple clamp, safe given small substeps)
      if (x1 - ball.r < 0) { x1 = ball.r; ball.vx = Math.abs(ball.vx); }
      if (x1 + ball.r > FIELD_W) { x1 = FIELD_W - ball.r; ball.vx = -Math.abs(ball.vx); }
      if (y1 - ball.r < 0) { y1 = ball.r; ball.vy = Math.abs(ball.vy); }

      // paddle sweep (only when moving downward)
      let bestT = null, bestKind = null, bestBrick = null;
      if (ball.vy > 0) {
        const hit = sweptCircleRect(x0, y0, x1, y1, ball.r, paddleRect);
        if (hit) { bestT = hit.t; bestKind = 'paddle'; }
      }

      // bricks
      for (const brick of state.bricks) {
        if (!brick.alive) continue;
        const hit = sweptCircleRect(x0, y0, x1, y1, ball.r, brick);
        if (hit && (bestT === null || hit.t < bestT)) {
          bestT = hit.t; bestKind = 'brick'; bestBrick = brick;
        }
      }

      if (bestKind === 'paddle') {
        const cx = x0 + (x1 - x0) * bestT;
        ball.x = cx;
        ball.y = PADDLE_Y - ball.r - 0.5;
        const rel = clamp((cx - (state.paddle.x + state.paddle.w / 2)) / (state.paddle.w / 2), -1, 1);
        const angle = rel * MAX_BOUNCE_ANGLE;
        const sp = Math.hypot(ball.vx, ball.vy) || speed;
        ball.vx = sp * Math.sin(angle);
        ball.vy = -Math.abs(sp * Math.cos(angle));
        state.combo = 0;
        Audio_.paddle();
        break;
      } else if (bestKind === 'brick') {
        const cx = x0 + (x1 - x0) * bestT;
        const cy = y0 + (y1 - y0) * bestT;
        ball.x = cx; ball.y = cy;
        const hit = sweptCircleRect(x0, y0, x1, y1, ball.r, bestBrick);
        if (hit.nx !== 0) ball.vx = -ball.vx;
        if (hit.ny !== 0) ball.vy = -ball.vy;
        hitBrick(bestBrick, cx, cy);
        break;
      } else {
        ball.x = x1; ball.y = y1;
      }
    }

    if (ball.y - ball.r > FIELD_H) {
      state.balls.splice(bi, 1);
      lost = true;
    }
    if (lost && state.balls.length === 0) {
      loseLife();
    }
  }

  updateDrops(dtSec, paddleRect);
  updateParticles(dtSec);
  if (state.shake > 0) state.shake = Math.max(0, state.shake - dtSec * 22);

  checkLevelClear();
}

function autopilotStep() {
  const ball = state.balls[0];
  if (!ball) return;
  const targetX = ball.x - state.paddle.w / 2;
  state.paddle.x += clamp(targetX - state.paddle.x, -PADDLE_SPEED * 1.6, PADDLE_SPEED * 1.6);
  if (!ball.launched) launchWaitingBalls();
}

/* ---------------------------------------------------------------------
   8. BRICKS, POWERUPS, PARTICLES, SCORE
   --------------------------------------------------------------------- */
function hitBrick(brick, x, y) {
  if (brick.type === 'x') {
    Audio_.brick(brick.row);
    spawnParticles(x, y, brick.color, 6);
    return;
  }
  brick.hp -= 1;
  Audio_.brick(brick.row);
  if (brick.hp <= 0) {
    brick.alive = false;
    state.combo += 1;
    const mult = 1 + Math.min(state.combo, 20) * 0.25;
    const points = Math.round(60 * mult);
    state.score += points;
    spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color, 12);
    if (state.combo >= 2) showComboText(state.combo, mult);
    maybeDropPowerUp(brick);
  } else {
    state.score += 15;
    spawnParticles(x, y, brick.color, 5);
  }
}

function maybeDropPowerUp(brick) {
  if (state.drops.length > 0) return;
  if (Math.random() > POWERUP_DROP_CHANCE) return;
  const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  state.drops.push({ x: brick.x + brick.w / 2, y: brick.y + brick.h / 2, vy: 2.4, type });
}

function updateDrops(dtSec, paddleRect) {
  for (let i = state.drops.length - 1; i >= 0; i--) {
    const d = state.drops[i];
    d.y += d.vy;
    const inX = d.x > paddleRect.x && d.x < paddleRect.x + paddleRect.w;
    const inY = d.y > paddleRect.y && d.y < paddleRect.y + paddleRect.h;
    if (inX && inY) {
      applyPowerUp(d.type);
      state.drops.splice(i, 1);
    } else if (d.y - 10 > FIELD_H) {
      state.drops.splice(i, 1);
    }
  }
}

function applyPowerUp(type) {
  Audio_.powerup();
  if (type === 'multi') {
    const base = state.balls.find((b) => b.launched) || state.balls[0];
    if (base) {
      const speed = Math.hypot(base.vx, base.vy) || currentBallSpeed();
      const baseAngle = Math.atan2(base.vx, -base.vy);
      [-0.5, 0.5].forEach((offset) => {
        const a = baseAngle + offset;
        state.balls.push({
          x: base.x, y: base.y,
          vx: speed * Math.sin(a), vy: -Math.abs(speed * Math.cos(a)),
          r: BALL_R, launched: true, trail: [], flatCounter: 0, vertCounter: 0,
        });
      });
    }
  } else if (type === 'wide') {
    state.activePowerUps.wide = POWERUP_DURATION;
  } else if (type === 'slow') {
    state.activePowerUps.slow = POWERUP_DURATION;
  } else if (type === 'life') {
    state.lives += 1;
  }
}

function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    state.particles.push({
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 0.5 + Math.random() * 0.3, color,
    });
  }
}

function updateParticles(dtSec) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx; p.y += p.vy;
    p.vx *= 0.95; p.vy *= 0.95;
    p.life -= dtSec;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
}

function loseLife() {
  state.lives -= 1;
  state.combo = 0;
  state.shake = 8;
  Audio_.life();
  if (state.lives <= 0) {
    endRun(false);
  } else {
    resetBall();
  }
}

function checkLevelClear() {
  if (state.phase !== 'playing') return;
  const cleared = state.bricks.every((b) => b.type === 'x' || !b.alive);
  if (!cleared) return;
  Audio_.fanfare();
  if (state.levelIndex >= 5) {
    endRun(true);
    return;
  }
  state.phase = 'transition';
  const nextIndex = state.levelIndex + 1;
  const nextDef = state.levels[nextIndex - 1];
  document.getElementById('transitionTitle').textContent = 'BÖLÜM ' + nextIndex;
  document.getElementById('transitionSub').textContent = nextDef ? nextDef.name : '';
  setScreen('transitionScreen');
  state.transitionUntil = performance.now() + 1800;
  setTimeout(() => {
    if (state.phase !== 'transition') return;
    state.levelIndex = nextIndex;
    buildLevel(state.levelIndex);
    state.phase = 'playing';
    setScreen(null);
    if (state.autoplay) {
      launchWaitingBalls();
      autoplayWarmup();
    }
  }, 1800);
}

function endRun(win) {
  state.win = win;
  state.phase = 'gameover';
  document.getElementById('endTitle').textContent = win ? 'KAZANDIN!' : 'OYUN BİTTİ';
  document.getElementById('endScore').textContent = 'Skor: ' + Math.round(state.score);
  document.getElementById('scoreError').textContent = '';
  document.getElementById('nameInput').value = '';
  state.freshScoreId = null;
  setScreen('endScreen');
  fetchAndRenderScores(document.getElementById('endTableWrap'));
}

/* ---------------------------------------------------------------------
   9. COMBO / FX TEXT
   --------------------------------------------------------------------- */
function showComboText(combo, mult) {
  const el = document.getElementById('comboText');
  el.textContent = 'KOMBO x' + combo + ' (' + mult.toFixed(2) + ')';
  el.classList.remove('show');
  void el.offsetWidth; // restart animation
  el.classList.add('show');
}

/* ---------------------------------------------------------------------
   10. RENDERING
   --------------------------------------------------------------------- */
function render() {
  const palette = state.level ? state.level.palette : { bg: '#070312', grid: '#1b1140', accent: '#00e6ff' };

  ctx.save();
  if (state.shake > 0) {
    ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
  }

  ctx.fillStyle = palette.bg;
  ctx.fillRect(-20, -20, FIELD_W + 40, FIELD_H + 40);

  drawGrid(palette.grid);

  if (state.phase === 'menu') {
    drawMenuAmbient();
  } else if (state.level) {
    drawBricks();
    drawParticles();
    drawDrops();
    drawPaddle(palette.accent);
    drawBalls(palette.accent);
  }

  ctx.restore();
}

function drawGrid(color) {
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 1;
  for (let x = 0; x <= FIELD_W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, FIELD_H); ctx.stroke();
  }
  for (let y = 0; y <= FIELD_H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(FIELD_W, y); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawBrick(b, ctx2) {
  const r = Math.min(6, b.h / 3);
  if (b.type === 'x') {
    ctx2.shadowBlur = 4;
    ctx2.shadowColor = '#000';
    const grad = ctx2.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
    grad.addColorStop(0, '#6a6a7c');
    grad.addColorStop(0.5, '#3a3a4a');
    grad.addColorStop(1, '#242430');
    ctx2.fillStyle = grad;
    roundRect(ctx2, b.x, b.y, b.w, b.h, r);
    ctx2.fill();
    ctx2.shadowBlur = 0;
    ctx2.strokeStyle = '#8a8aa0';
    ctx2.lineWidth = 1;
    roundRect(ctx2, b.x + 1, b.y + 1, b.w - 2, b.h - 2, r);
    ctx2.stroke();
    // rivets to read as solid metal
    ctx2.fillStyle = 'rgba(0,0,0,0.4)';
    ctx2.beginPath(); ctx2.arc(b.x + 6, b.y + b.h / 2, 1.6, 0, Math.PI * 2); ctx2.fill();
    ctx2.beginPath(); ctx2.arc(b.x + b.w - 6, b.y + b.h / 2, 1.6, 0, Math.PI * 2); ctx2.fill();
    return;
  }

  const cracked = b.type === 't' && b.hp === 1;
  ctx2.shadowBlur = cracked ? 8 : 16;
  ctx2.shadowColor = b.color;
  ctx2.globalAlpha = cracked ? 0.72 : 1;
  ctx2.fillStyle = b.color;
  roundRect(ctx2, b.x, b.y, b.w, b.h, r);
  ctx2.fill();

  // soft top-bevel highlight
  ctx2.shadowBlur = 0;
  const hl = ctx2.createLinearGradient(b.x, b.y, b.x, b.y + b.h * 0.55);
  hl.addColorStop(0, 'rgba(255,255,255,0.45)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx2.fillStyle = hl;
  roundRect(ctx2, b.x + 1, b.y + 1, b.w - 2, b.h * 0.5, r * 0.8);
  ctx2.fill();

  if (cracked) {
    ctx2.globalAlpha = 1;
    ctx2.strokeStyle = 'rgba(5,2,10,0.65)';
    ctx2.lineWidth = 1.4;
    ctx2.beginPath();
    ctx2.moveTo(b.x + 3, b.y + 2);
    ctx2.lineTo(b.x + b.w * 0.45, b.y + b.h * 0.55);
    ctx2.lineTo(b.x + b.w * 0.3, b.y + b.h - 3);
    ctx2.moveTo(b.x + b.w * 0.45, b.y + b.h * 0.55);
    ctx2.lineTo(b.x + b.w - 4, b.y + 4);
    ctx2.stroke();
  }
}

function drawBricks() {
  for (const b of state.bricks) {
    if (!b.alive) continue;
    ctx.save();
    drawBrick(b, ctx);
    ctx.restore();
  }
}

function drawPaddle(accent) {
  const p = state.paddle;
  ctx.save();
  ctx.shadowBlur = 26;
  ctx.shadowColor = accent;
  const r = 7;
  const grad = ctx.createLinearGradient(p.x, PADDLE_Y, p.x, PADDLE_Y + PADDLE_H);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.35, accent);
  grad.addColorStop(1, accent);
  ctx.fillStyle = grad;
  roundRect(ctx, p.x, PADDLE_Y, p.w, PADDLE_H, r);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  roundRect(ctx, p.x + 2, PADDLE_Y + 1.5, p.w - 4, PADDLE_H * 0.32, r * 0.6);
  ctx.fill();
  ctx.restore();
}

function drawBalls(accent) {
  for (const b of state.balls) {
    for (let i = 0; i < b.trail.length; i++) {
      const t = b.trail[i];
      const alpha = (i + 1) / (b.trail.length + 1) * 0.5;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.arc(t.x, t.y, b.r * 0.75, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.save();
    ctx.shadowBlur = 22;
    ctx.shadowColor = accent;
    const grad = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, 0, b.x, b.y, b.r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.6, '#ffffff');
    grad.addColorStop(1, accent);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawParticles() {
  for (const p of state.particles) {
    ctx.save();
    ctx.globalAlpha = clamp(p.life, 0, 1);
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 6;
    ctx.shadowColor = p.color;
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    ctx.restore();
  }
}

function drawDrops() {
  const colors = { multi: '#ff2d95', wide: '#00e6ff', slow: '#7cff5a', life: '#ffd23f' };
  for (const d of state.drops) {
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = colors[d.type] || '#fff';
    ctx.fillStyle = colors[d.type] || '#fff';
    roundRect(ctx, d.x - 12, d.y - 10, 24, 20, 5);
    ctx.fill();
    ctx.restore();
  }
}

/* ---- Menu ambient backdrop: idle bricks + demo ball + drifting glow ---- */
function buildMenuBricks() {
  const cols = 11, rows = 4, h = 30;
  const brickW = (FIELD_W - 2 * BRICK_SIDE - (cols - 1) * BRICK_GAP) / cols;
  const colors = ['#ff2d95', '#00e6ff', '#7cff5a', '#ffd23f'];
  const bricks = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 3 === 1) continue;
      bricks.push({
        x: BRICK_SIDE + c * (brickW + BRICK_GAP),
        y: BRICK_TOP + r * (h + BRICK_GAP),
        w: brickW, h,
        type: 'n', hp: 1, alive: true,
        color: colors[(r + c) % colors.length],
      });
    }
  }
  return bricks;
}

const menuAmbient = {
  bricks: buildMenuBricks(),
  ball: { x: 220, y: 260, vx: 1.5, vy: 1.1, r: 7, trail: [] },
  glows: [
    { x: 150, y: 150, r: 130, color: '#ff2d95', vx: 0.12, vy: 0.07 },
    { x: 660, y: 430, r: 170, color: '#00e6ff', vx: -0.09, vy: 0.1 },
    { x: 720, y: 150, r: 110, color: '#7cff5a', vx: -0.07, vy: -0.09 },
  ],
};

function updateMenuAmbient(dtSec) {
  const b = menuAmbient.ball;
  b.trail.push({ x: b.x, y: b.y });
  if (b.trail.length > 12) b.trail.shift();
  b.x += b.vx; b.y += b.vy;
  if (b.x < b.r || b.x > FIELD_W - b.r) { b.vx *= -1; b.x = clamp(b.x, b.r, FIELD_W - b.r); }
  if (b.y < b.r || b.y > FIELD_H - b.r) { b.vy *= -1; b.y = clamp(b.y, b.r, FIELD_H - b.r); }
  for (const g of menuAmbient.glows) {
    g.x += g.vx; g.y += g.vy;
    if (g.x < -g.r || g.x > FIELD_W + g.r) g.vx *= -1;
    if (g.y < -g.r || g.y > FIELD_H + g.r) g.vy *= -1;
  }
}

function drawMenuAmbient() {
  ctx.save();
  for (const g of menuAmbient.glows) {
    const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r);
    grad.addColorStop(0, g.color + '2e');
    grad.addColorStop(1, g.color + '00');
    ctx.fillStyle = grad;
    ctx.fillRect(g.x - g.r, g.y - g.r, g.r * 2, g.r * 2);
  }
  ctx.globalAlpha = 0.55;
  for (const brick of menuAmbient.bricks) drawBrick(brick, ctx);
  ctx.globalAlpha = 1;
  const b = menuAmbient.ball;
  for (let i = 0; i < b.trail.length; i++) {
    const t = b.trail[i];
    const alpha = (i + 1) / (b.trail.length + 1) * 0.3;
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.arc(t.x, t.y, b.r * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 18;
  ctx.shadowColor = '#00e6ff';
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

/* ---------------------------------------------------------------------
   11. HUD
   --------------------------------------------------------------------- */
function updateHUD() {
  const livesEl = document.getElementById('hudLives');
  livesEl.textContent = '';
  const maxLives = Math.max(state.lives, 3);
  for (let i = 0; i < maxLives; i++) {
    const dot = document.createElement('span');
    dot.className = 'life-icon' + (i < state.lives ? '' : ' lost');
    livesEl.appendChild(dot);
  }

  state.displayScore += (state.score - state.displayScore) * 0.15;
  if (Math.abs(state.score - state.displayScore) < 1) state.displayScore = state.score;
  document.getElementById('hudScore').textContent = Math.round(state.displayScore);

  document.getElementById('hudLevel').textContent = state.level
    ? 'BÖLÜM ' + state.level.index + ' - ' + state.level.name
    : '';

  const chipsEl = document.getElementById('hudChips');
  chipsEl.textContent = '';
  for (const type of Object.keys(state.activePowerUps)) {
    const chip = document.createElement('span');
    chip.className = 'chip';
    const label = document.createElement('span');
    label.textContent = POWERUP_LABELS[type] || type;
    const time = document.createElement('span');
    time.className = 'chip-time';
    time.textContent = Math.ceil(state.activePowerUps[type]) + 's';
    chip.appendChild(label);
    chip.appendChild(time);
    chipsEl.appendChild(chip);
  }

  const muteBtn = document.getElementById('muteBtn');
  muteBtn.textContent = state.muted ? 'SESSİZ' : 'SES';
  muteBtn.classList.toggle('muted', state.muted);
}

/* ---------------------------------------------------------------------
   12. SCREENS / UI WIRING
   --------------------------------------------------------------------- */
function setScreen(name) {
  const screens = ['menuScreen', 'pauseScreen', 'transitionScreen', 'endScreen'];
  for (const id of screens) {
    document.getElementById(id).classList.toggle('hidden', id !== name);
  }
  if (name !== 'pauseScreen') {
    document.getElementById('stage').classList.remove('blurred');
  }
  const hudVisible = name === null || name === 'pauseScreen' || name === 'transitionScreen';
  document.getElementById('hud').classList.toggle('hidden', !hudVisible);
}

function startRun(levelIndex) {
  state.levelIndex = levelIndex || 1;
  state.lives = 3;
  state.score = 0;
  state.displayScore = 0;
  state.combo = 0;
  buildLevel(state.levelIndex);
  state.phase = 'playing';
  setScreen(null);
  if (state.autoplay) {
    launchWaitingBalls();
    autoplayWarmup();
  }
}

// Headless/CI captures often grab the very first rendered frame before the
// rAF loop has ticked much real time. Fast-forward physics synchronously so
// autoplay always shows a real mid-play frame right away.
function autoplayWarmup() {
  const maxTicks = 200;
  for (let i = 0; i < maxTicks && state.phase === 'playing'; i++) {
    updatePhysics(FIXED_DT / 1000);
  }
}

function toggleMute() {
  state.muted = !state.muted;
  Audio_.setMuted(state.muted);
}

function wireUI() {
  document.getElementById('btnStart').addEventListener('click', () => { Audio_.init(); startRun(1); });
  document.getElementById('btnHow').addEventListener('click', () => {
    document.getElementById('howPanel').classList.remove('hidden');
  });
  document.getElementById('btnHowClose').addEventListener('click', () => {
    document.getElementById('howPanel').classList.add('hidden');
  });
  document.getElementById('btnBoard').addEventListener('click', () => {
    document.getElementById('boardPanel').classList.remove('hidden');
    fetchAndRenderScores(document.getElementById('boardTableWrap'));
  });
  document.getElementById('btnBoardClose').addEventListener('click', () => {
    document.getElementById('boardPanel').classList.add('hidden');
  });
  document.getElementById('muteBtn').addEventListener('click', toggleMute);
  document.getElementById('btnRestart').addEventListener('click', () => {
    state.phase = 'menu';
    setScreen('menuScreen');
  });
  document.getElementById('scoreForm').addEventListener('submit', (e) => {
    e.preventDefault();
    submitScore();
  });
}

/* ---------------------------------------------------------------------
   13. LEADERBOARD
   --------------------------------------------------------------------- */
function renderScoreTable(container, scores, freshId) {
  container.textContent = '';
  const table = document.createElement('table');
  table.className = 'score-table';
  const thead = document.createElement('thead');
  thead.innerHTML = '';
  const headRow = document.createElement('tr');
  ['Sıra', 'İsim', 'Skor', 'Bölüm', 'Tarih'].forEach((h) => {
    const th = document.createElement('th');
    th.textContent = h;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  scores.forEach((entry, i) => {
    const tr = document.createElement('tr');
    if (entry.id === freshId) tr.classList.add('fresh');
    const cells = [
      String(i + 1), entry.name, String(entry.score), String(entry.level),
      new Date(entry.created_at).toLocaleDateString('tr-TR'),
    ];
    cells.forEach((val) => {
      const td = document.createElement('td');
      td.textContent = val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

async function fetchAndRenderScores(container, freshId) {
  container.textContent = 'Yükleniyor...';
  try {
    const res = await fetch('/api/scores?limit=10');
    const data = await res.json();
    if (data && data.ok) {
      renderScoreTable(container, data.scores, freshId);
    } else {
      container.textContent = 'Sıralama yüklenemedi.';
    }
  } catch (e) {
    container.textContent = 'Sıralama yüklenemedi.';
  }
}

async function submitScore() {
  const nameInput = document.getElementById('nameInput');
  const errEl = document.getElementById('scoreError');
  errEl.textContent = '';
  const body = { name: nameInput.value, score: Math.round(state.score), level: state.levelIndex };
  try {
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.status === 201 && data.ok) {
      state.freshScoreId = data.entry.id;
      renderScoreTable(document.getElementById('endTableWrap'), data.top, data.entry.id);
      nameInput.value = '';
    } else {
      errEl.textContent = data.error || 'Skor gönderilemedi.';
    }
  } catch (e) {
    errEl.textContent = 'Sunucuya ulaşılamadı.';
  }
}

/* ---------------------------------------------------------------------
   14. DEBUG HOOKS
   --------------------------------------------------------------------- */
function buildDebugState() {
  return {
    phase: state.phase,
    level: state.levelIndex,
    lives: state.lives,
    score: state.score,
    combo: state.combo,
    paddle: { x: state.paddle.x, y: PADDLE_Y, w: state.paddle.w, h: PADDLE_H },
    balls: state.balls.map((b) => ({ x: b.x, y: b.y, vx: b.vx, vy: b.vy, r: b.r, launched: b.launched })),
    bricks: state.bricks.map((b) => ({ row: b.row, col: b.col, type: b.type, hp: b.hp, alive: b.alive })),
    powerups: state.drops.map((d) => ({ x: d.x, y: d.y, type: d.type })),
    activePowerUps: Object.keys(state.activePowerUps).map((type) => ({ type, remaining: state.activePowerUps[type] })),
    muted: state.muted,
  };
}

function installDebugHooks() {
  const NB = {};
  Object.defineProperty(NB, 'state', { get: buildDebugState });
  NB.start = () => startRun(1);
  NB.goToLevel = (n) => {
    const idx = clamp(Math.round(n), 1, 5);
    if (state.phase === 'menu' || state.phase === 'gameover') {
      state.lives = 3; state.score = 0; state.displayScore = 0;
    }
    state.levelIndex = idx;
    buildLevel(idx);
    state.phase = 'playing';
    setScreen(null);
  };
  NB.clearBricks = () => {
    for (const b of state.bricks) {
      if (b.type !== 'x') b.alive = false;
    }
  };
  NB.dropPowerUp = (type) => {
    if (!POWERUP_TYPES.includes(type)) return;
    const ball = state.balls[0];
    const x = ball ? ball.x : FIELD_W / 2;
    const y = ball ? ball.y : 100;
    state.drops.push({ x, y, vy: 2.4, type });
  };
  NB.togglePause = () => togglePauseKey();
  NB.stepPhysics = (n) => {
    const steps = Math.max(0, Math.round(n));
    for (let i = 0; i < steps; i++) updatePhysics(FIXED_DT / 1000);
  };
  window.NB = NB;
}

/* ---------------------------------------------------------------------
   15. CANVAS SIZING (device pixel ratio)
   --------------------------------------------------------------------- */
function setupCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = FIELD_W * dpr;
  canvas.height = FIELD_H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/* ---------------------------------------------------------------------
   16. MAIN LOOP
   --------------------------------------------------------------------- */
let accumulator = 0;
let lastTime = 0;

function loop(now) {
  if (!lastTime) lastTime = now;
  let delta = now - lastTime;
  lastTime = now;
  if (delta > 250) delta = 250;

  if (state.phase === 'countdown') {
    if (now >= state.countdownNextTick) {
      state.countdownValue -= 1;
      state.countdownNextTick += 1000;
      const ct = document.getElementById('countdownText');
      if (state.countdownValue > 0) {
        ct.textContent = String(state.countdownValue);
      } else {
        state.phase = 'playing';
        accumulator = 0;
        ct.classList.add('hidden');
        setScreen(null);
      }
    }
  }

  if (state.phase === 'playing') {
    accumulator += delta;
    let steps = 0;
    while (accumulator >= FIXED_DT && steps < 8) {
      updatePhysics(FIXED_DT / 1000);
      accumulator -= FIXED_DT;
      steps++;
    }
  } else {
    accumulator = 0;
    if (state.phase === 'menu') updateMenuAmbient(delta / 1000);
  }

  render();
  updateHUD();
  requestAnimationFrame(loop);
}

/* ---------------------------------------------------------------------
   17. BOOT
   --------------------------------------------------------------------- */
function parseQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const levelParam = params.get('level');
  if (params.get('autoplay') === '1' || levelParam) {
    state.autoplay = true;
    const idx = levelParam ? clamp(parseInt(levelParam, 10) || 1, 1, 5) : 1;
    startRun(idx);
  }
}

async function boot() {
  setupCanvas();
  wireUI();
  await loadLevels();
  installDebugHooks();
  parseQueryParams();
  requestAnimationFrame(loop);
}

document.addEventListener('DOMContentLoaded', boot);
