// Salon Sohbeti frontend. Plain ESM, no build step, no framework.

const AVATAR_COLORS = ['#C15F3C', '#2E7D6B', '#3A6EA5', '#8E5BA6', '#B3892C', '#B54B5B', '#4A7C3F', '#5A6270'];
const EMOJIS = ['\u{1F44D}', '❤️', '\u{1F602}', '\u{1F389}', '\u{1F44F}'];
const MAX_BACKOFF_MS = 5000;

const LS_USER = 'salon.user';
const LS_THEME = 'salon.theme';
const LS_SOUND = 'salon.sound';
const LS_UNREAD = 'salon.unread';

// ---- state ----

const state = {
  user: null,
  rooms: [],
  activeRoomId: null,
  messages: [],
  online: [],
  unread: {},
  typingUsers: new Map(), // userId -> {userName, timer}
  theme: 'light',
  sound: 'on',
  ws: null,
  wsBackoff: 500,
  firstWelcomeReceived: false,
  pendingColor: null, // color chosen on join screen before submit
};

// ---- utilities ----

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function randomId() {
  return 'u_' + Math.random().toString(36).slice(2, 10);
}

function escapeText(el, text) {
  el.textContent = text;
}

function initialOf(name) {
  const trimmed = (name || '').trim();
  return trimmed ? trimmed[0].toUpperCase() : '?';
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function formatDay(ts) {
  const d = new Date(ts);
  const today = new Date();
  const isSameDay = d.toDateString() === today.toDateString();
  if (isSameDay) return 'Bugün';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Dün';
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function dayKey(ts) {
  return new Date(ts).toDateString();
}

// ---- DOM refs ----

const el = {
  joinScreen: document.getElementById('join-screen'),
  joinName: document.getElementById('join-name'),
  joinColors: document.getElementById('join-colors'),
  joinSubmit: document.getElementById('join-submit'),

  shell: document.getElementById('shell'),
  topbarRoom: document.getElementById('topbar-room'),
  connectionPill: document.getElementById('connection-pill'),
  profileChip: document.getElementById('profile-chip'),
  profileAvatar: document.getElementById('profile-avatar'),
  profileName: document.getElementById('profile-name'),

  navSohbet: document.getElementById('nav-sohbet'),
  navKatil: document.getElementById('nav-katil'),
  navAyarlar: document.getElementById('nav-ayarlar'),

  screenSohbet: document.getElementById('screen-sohbet'),
  screenKatil: document.getElementById('screen-katil'),
  screenAyarlar: document.getElementById('screen-ayarlar'),

  roomList: document.getElementById('room-list'),
  createRoomBtn: document.getElementById('create-room-btn'),

  searchInput: document.getElementById('search-input'),
  searchResults: document.getElementById('search-results'),

  chatLoading: document.getElementById('chat-loading'),
  messageList: document.getElementById('message-list'),
  emptyMessages: document.getElementById('empty-messages'),
  typingLine: document.getElementById('typing-line'),

  composerForm: document.getElementById('composer-form'),
  composerInput: document.getElementById('composer-input'),

  onlineList: document.getElementById('online-list'),
  emptyOnline: document.getElementById('empty-online'),

  katilQr: document.getElementById('katil-qr'),
  katilUrl: document.getElementById('katil-url'),
  katilError: document.getElementById('katil-error'),

  settingsPreviewAvatar: document.getElementById('settings-preview-avatar'),
  settingsPreviewName: document.getElementById('settings-preview-name'),
  settingsTheme: document.getElementById('settings-theme'),
  settingsSound: document.getElementById('settings-sound'),
  settingsNameInput: document.getElementById('settings-name-input'),
  settingsColors: document.getElementById('settings-colors'),
  settingsSave: document.getElementById('settings-save'),
  settingsSaved: document.getElementById('settings-saved'),
};

// ---- color pickers ----

function buildColorPicker(container, selectedColor, onPick) {
  container.textContent = '';
  for (const color of AVATAR_COLORS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'color-swatch';
    btn.style.backgroundColor = color;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(color === selectedColor));
    btn.setAttribute('aria-label', color);
    btn.addEventListener('click', () => {
      onPick(color);
      for (const child of container.children) {
        child.setAttribute('aria-checked', String(child === btn));
      }
    });
    container.appendChild(btn);
  }
}

// ---- join screen ----

function initJoinScreen() {
  state.pendingColor = AVATAR_COLORS[0];
  buildColorPicker(el.joinColors, state.pendingColor, (color) => {
    state.pendingColor = color;
  });

  const updateSubmit = () => {
    el.joinSubmit.disabled = el.joinName.value.trim().length === 0;
  };
  el.joinName.addEventListener('input', updateSubmit);
  updateSubmit();

  el.joinSubmit.addEventListener('click', () => {
    const name = el.joinName.value.trim();
    if (!name) return;
    const user = { id: randomId(), name, color: state.pendingColor };
    saveJson(LS_USER, user);
    state.user = user;
    enterShell();
  });
}

// ---- theme and sound ----

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  el.settingsTheme.setAttribute('aria-checked', String(theme === 'dark'));
}

function applySound(sound) {
  state.sound = sound;
  el.settingsSound.setAttribute('aria-checked', String(sound === 'on'));
}

let audioCtx = null;
function playBeep() {
  if (state.sound !== 'on') return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } catch {
    // audio unavailable, ignore
  }
}

// ---- profile chip ----

function renderProfileChip() {
  if (!state.user) return;
  el.profileAvatar.textContent = initialOf(state.user.name);
  el.profileAvatar.style.backgroundColor = state.user.color;
  escapeText(el.profileName, state.user.name);
}

// ---- unread counts ----

function persistUnread() {
  saveJson(LS_UNREAD, state.unread);
}

function bumpUnread(roomId) {
  if (roomId === state.activeRoomId) return;
  state.unread[roomId] = (state.unread[roomId] || 0) + 1;
  persistUnread();
  renderRoomList();
}

function clearUnread(roomId) {
  if (state.unread[roomId]) {
    delete state.unread[roomId];
    persistUnread();
  }
}

// ---- rendering: rooms ----

function renderRoomList() {
  el.roomList.textContent = '';
  for (const room of state.rooms) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'room-item';
    btn.dataset.roomId = String(room.id);
    if (room.id === state.activeRoomId) btn.setAttribute('data-active', 'true');

    const name = document.createElement('span');
    name.className = 'room-item-name';
    escapeText(name, room.name);
    btn.appendChild(name);

    const count = state.unread[room.id] || 0;
    if (count > 0) {
      const badge = document.createElement('span');
      badge.className = 'unread-badge';
      escapeText(badge, count > 99 ? '99+' : String(count));
      btn.appendChild(badge);
    }

    btn.addEventListener('click', () => switchRoom(room.id));
    li.appendChild(btn);
    el.roomList.appendChild(li);
  }
}

function activeRoomName() {
  const room = state.rooms.find((r) => r.id === state.activeRoomId);
  return room ? room.name : '';
}

function renderTopbar() {
  escapeText(el.topbarRoom, activeRoomName());
}

// ---- rendering: messages ----

const STICK_TO_BOTTOM_THRESHOLD = 120;
const GROUP_WINDOW_MS = 5 * 60 * 1000;

function isNearBottom() {
  const list = el.messageList;
  return list.scrollHeight - list.scrollTop - list.clientHeight < STICK_TO_BOTTOM_THRESHOLD;
}

function scrollMessagesToBottom() {
  el.messageList.scrollTop = el.messageList.scrollHeight;
  requestAnimationFrame(() => {
    el.messageList.scrollTop = el.messageList.scrollHeight;
  });
}

function renderMessages(forceScrollToBottom = true) {
  const shouldStick = forceScrollToBottom || isNearBottom();

  el.messageList.textContent = '';
  if (state.messages.length === 0) {
    el.emptyMessages.hidden = false;
    el.messageList.hidden = true;
    return;
  }
  el.emptyMessages.hidden = true;
  el.messageList.hidden = false;

  let lastDay = null;
  let prevMsg = null;
  for (const msg of state.messages) {
    const day = dayKey(msg.createdAt);
    if (day !== lastDay) {
      const divider = document.createElement('div');
      divider.className = 'day-divider';
      escapeText(divider, formatDay(msg.createdAt));
      el.messageList.appendChild(divider);
      lastDay = day;
      prevMsg = null;
    }
    const grouped = !!prevMsg
      && prevMsg.userId === msg.userId
      && (msg.createdAt - prevMsg.createdAt) < GROUP_WINDOW_MS;
    el.messageList.appendChild(buildMessageRow(msg, grouped));
    prevMsg = msg;
  }

  if (shouldStick) scrollMessagesToBottom();
}

function buildMessageRow(msg, grouped) {
  const row = document.createElement('div');
  row.className = grouped ? 'message-row is-grouped' : 'message-row';
  row.id = 'message-' + msg.id;

  if (!grouped) {
    const avatar = document.createElement('span');
    avatar.className = 'avatar avatar-md';
    avatar.style.backgroundColor = msg.userColor;
    escapeText(avatar, initialOf(msg.userName));
    row.appendChild(avatar);
  }

  const body = document.createElement('div');
  body.className = 'message-body';

  if (!grouped) {
    const head = document.createElement('div');
    head.className = 'message-head';
    const author = document.createElement('span');
    author.className = 'message-author';
    escapeText(author, msg.userName);
    const time = document.createElement('span');
    time.className = 'message-time';
    escapeText(time, formatTime(msg.createdAt));
    head.appendChild(author);
    head.appendChild(time);
    body.appendChild(head);
  }

  const text = document.createElement('p');
  text.className = 'message-text';
  escapeText(text, msg.text);
  body.appendChild(text);

  body.appendChild(buildReactionBar(msg));

  row.appendChild(body);
  return row;
}

function buildReactionBar(msg) {
  const bar = document.createElement('div');
  bar.className = 'reaction-bar';

  const reactions = msg.reactions || {};
  for (const emoji of EMOJIS) {
    const userIds = reactions[emoji];
    if (!userIds || userIds.length === 0) continue;
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'reaction-pill';
    const mine = state.user && userIds.includes(state.user.id);
    pill.setAttribute('data-mine', String(!!mine));
    pill.textContent = emoji + ' ' + userIds.length;
    pill.addEventListener('click', () => sendReact(msg.id, emoji));
    bar.appendChild(pill);
  }

  const picker = document.createElement('div');
  picker.className = 'reaction-picker';
  for (const emoji of EMOJIS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'reaction-picker-btn';
    btn.textContent = emoji;
    btn.setAttribute('aria-label', 'Tepki ekle ' + emoji);
    btn.addEventListener('click', () => sendReact(msg.id, emoji));
    picker.appendChild(btn);
  }
  bar.appendChild(picker);

  return bar;
}

function updateMessageReactions(messageId, reactions) {
  const msg = state.messages.find((m) => m.id === messageId);
  if (!msg) return;
  msg.reactions = reactions;
  const row = document.getElementById('message-' + messageId);
  if (!row) return;
  const body = row.querySelector('.message-body');
  const oldBar = body.querySelector('.reaction-bar');
  const newBar = buildReactionBar(msg);
  body.replaceChild(newBar, oldBar);
}

// ---- rendering: online list ----

function renderOnline() {
  el.onlineList.textContent = '';
  if (state.online.length === 0) {
    el.emptyOnline.hidden = false;
    el.onlineList.hidden = true;
    return;
  }
  el.emptyOnline.hidden = true;
  el.onlineList.hidden = false;
  for (const user of state.online) {
    const li = document.createElement('li');
    li.className = 'online-item';
    const avatar = document.createElement('span');
    avatar.className = 'avatar avatar-sm';
    avatar.style.backgroundColor = user.color;
    escapeText(avatar, initialOf(user.name));
    const name = document.createElement('span');
    name.className = 'online-item-name';
    escapeText(name, user.name);
    li.appendChild(avatar);
    li.appendChild(name);
    el.onlineList.appendChild(li);
  }
}

// ---- typing ----

function renderTyping() {
  const names = Array.from(state.typingUsers.values()).map((v) => v.userName);
  if (names.length === 0) {
    el.typingLine.textContent = '';
    return;
  }
  const text = names.length === 1
    ? names[0] + ' yazıyor...'
    : names.join(', ') + ' yazıyor...';
  escapeText(el.typingLine, text);
}

function setTypingUser(userId, userName, isTyping) {
  if (isTyping) {
    const existing = state.typingUsers.get(userId);
    if (existing) clearTimeout(existing.timer);
    const timer = setTimeout(() => {
      state.typingUsers.delete(userId);
      renderTyping();
    }, 4000);
    state.typingUsers.set(userId, { userName, timer });
  } else {
    const existing = state.typingUsers.get(userId);
    if (existing) clearTimeout(existing.timer);
    state.typingUsers.delete(userId);
  }
  renderTyping();
}

// ---- search ----

let searchDebounce = null;

function initSearch() {
  el.searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    const q = el.searchInput.value.trim();
    if (!q) {
      el.searchResults.hidden = true;
      el.searchResults.textContent = '';
      return;
    }
    searchDebounce = setTimeout(() => runSearch(q), 250);
  });

  document.addEventListener('click', (event) => {
    if (!el.searchResults.contains(event.target) && event.target !== el.searchInput) {
      el.searchResults.hidden = true;
    }
  });
}

async function runSearch(query) {
  if (!state.activeRoomId) return;
  try {
    const res = await fetch(`/api/rooms/${state.activeRoomId}/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    renderSearchResults(data.hits || []);
  } catch {
    el.searchResults.hidden = true;
  }
}

function renderSearchResults(hits) {
  el.searchResults.textContent = '';
  if (hits.length === 0) {
    el.searchResults.hidden = true;
    return;
  }
  el.searchResults.hidden = false;
  for (const hit of hits) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'search-hit';

    const meta = document.createElement('span');
    meta.className = 'search-hit-meta';
    escapeText(meta, hit.userName + ' · ' + formatTime(hit.createdAt));

    const text = document.createElement('span');
    text.className = 'search-hit-text';
    escapeText(text, hit.text);

    btn.appendChild(meta);
    btn.appendChild(text);
    btn.addEventListener('click', () => jumpToMessage(hit.id));
    li.appendChild(btn);
    el.searchResults.appendChild(li);
  }
}

function jumpToMessage(messageId) {
  el.searchResults.hidden = true;
  el.searchInput.value = '';
  const row = document.getElementById('message-' + messageId);
  if (row) {
    row.scrollIntoView({ block: 'center' });
    row.classList.add('highlight');
    setTimeout(() => row.classList.remove('highlight'), 1500);
  }
}

// ---- room switching ----

function switchRoom(roomId) {
  if (roomId === state.activeRoomId) return;
  state.activeRoomId = roomId;
  clearUnread(roomId);
  el.chatLoading.hidden = false;
  el.messageList.hidden = true;
  el.emptyMessages.hidden = true;
  el.searchInput.value = '';
  el.searchResults.hidden = true;
  state.typingUsers.clear();
  renderTyping();
  renderRoomList();
  renderTopbar();
  sendFrame({ type: 'switch', roomId });
}

// ---- create room ----

function initCreateRoom() {
  el.createRoomBtn.addEventListener('click', async () => {
    const name = prompt('Yeni oda adı:');
    if (!name || !name.trim()) return;
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Oda oluşturulamadı.');
      }
    } catch {
      alert('Oda oluşturulamadı, bağlantı sorunu olabilir.');
    }
  });
}

// ---- composer ----

let typingActive = false;
let typingStopTimer = null;

function initComposer() {
  el.composerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessageText();
  });

  el.composerInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessageText();
    }
  });

  el.composerInput.addEventListener('input', () => {
    el.composerInput.style.height = 'auto';
    el.composerInput.style.height = Math.min(el.composerInput.scrollHeight, 140) + 'px';

    if (!typingActive) {
      typingActive = true;
      sendFrame({ type: 'typing', isTyping: true });
    }
    clearTimeout(typingStopTimer);
    typingStopTimer = setTimeout(() => {
      typingActive = false;
      sendFrame({ type: 'typing', isTyping: false });
    }, 2000);
  });
}

function sendMessageText() {
  const text = el.composerInput.value.trim();
  if (!text) return;
  sendFrame({ type: 'message', text: text.slice(0, 1000) });
  el.composerInput.value = '';
  el.composerInput.style.height = 'auto';
  clearTimeout(typingStopTimer);
  if (typingActive) {
    typingActive = false;
    sendFrame({ type: 'typing', isTyping: false });
  }
}

function sendReact(messageId, emoji) {
  sendFrame({ type: 'react', messageId, emoji });
}

// ---- navigation ----

function currentRoute() {
  const hash = location.hash || '#/sohbet';
  if (hash.startsWith('#/katil')) return 'katil';
  if (hash.startsWith('#/ayarlar')) return 'ayarlar';
  return 'sohbet';
}

function renderRoute() {
  const route = currentRoute();
  el.screenSohbet.hidden = route !== 'sohbet';
  el.screenKatil.hidden = route !== 'katil';
  el.screenAyarlar.hidden = route !== 'ayarlar';

  el.navSohbet.removeAttribute('data-active');
  el.navKatil.removeAttribute('data-active');
  el.navAyarlar.removeAttribute('data-active');
  if (route === 'sohbet') el.navSohbet.setAttribute('data-active', 'true');
  if (route === 'katil') {
    el.navKatil.setAttribute('data-active', 'true');
    loadKatilScreen();
  }
  if (route === 'ayarlar') {
    el.navAyarlar.setAttribute('data-active', 'true');
    fillSettingsForm();
  }
}

function initNavigation() {
  window.addEventListener('hashchange', renderRoute);
  el.profileChip.addEventListener('click', () => {
    location.hash = '#/ayarlar';
  });
}

// ---- katil screen ----

let katilLoaded = false;

async function loadKatilScreen() {
  if (katilLoaded) return;
  katilLoaded = true;
  try {
    const res = await fetch('/api/join');
    if (!res.ok) throw new Error('bad status');
    const data = await res.json();
    el.katilQr.src = data.qr;
    el.katilQr.hidden = false;
    escapeText(el.katilUrl, data.lanUrl || data.url);
    el.katilError.hidden = true;
  } catch {
    el.katilError.hidden = false;
    el.katilQr.hidden = true;
    katilLoaded = false;
  }
}

// ---- ayarlar screen ----

function updateSettingsPreview() {
  if (!state.user) return;
  el.settingsPreviewAvatar.textContent = initialOf(state.user.name);
  el.settingsPreviewAvatar.style.backgroundColor = state.user.color;
  escapeText(el.settingsPreviewName, state.user.name);
}

function fillSettingsForm() {
  el.settingsNameInput.value = state.user ? state.user.name : '';
  buildColorPicker(el.settingsColors, state.user ? state.user.color : AVATAR_COLORS[0], () => {});
  el.settingsSaved.hidden = true;
  updateSettingsPreview();
}

function initSettings() {
  el.settingsTheme.addEventListener('click', () => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(LS_THEME, next);
  });

  el.settingsSound.addEventListener('click', () => {
    const next = state.sound === 'on' ? 'off' : 'on';
    applySound(next);
    localStorage.setItem(LS_SOUND, next);
  });

  el.settingsSave.addEventListener('click', () => {
    const name = el.settingsNameInput.value.trim();
    if (!name) return;
    const checked = el.settingsColors.querySelector('[aria-checked="true"]');
    const color = checked ? checked.getAttribute('aria-label') : state.user.color;
    state.user = { ...state.user, name, color };
    saveJson(LS_USER, state.user);
    renderProfileChip();
    updateSettingsPreview();
    sendFrame({ type: 'profile', user: state.user });
    el.settingsSaved.hidden = false;
  });
}

// ---- websocket ----

function wsUrl() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.host}/ws`;
}

function sendFrame(frame) {
  if (state.ws && state.ws.readyState === WebSocket.OPEN) {
    state.ws.send(JSON.stringify(frame));
  }
}

function setConnectionState(connected) {
  el.connectionPill.dataset.state = connected ? 'connected' : 'reconnecting';
  escapeText(el.connectionPill, connected ? 'bağlı' : 'yeniden bağlanılıyor...');
}

function connectWebSocket() {
  const ws = new WebSocket(wsUrl());
  state.ws = ws;

  ws.addEventListener('open', () => {
    setConnectionState(true);
    state.wsBackoff = 500;
    sendFrame({ type: 'hello', user: state.user, roomId: state.activeRoomId || undefined });
  });

  ws.addEventListener('message', (event) => {
    let frame;
    try {
      frame = JSON.parse(event.data);
    } catch {
      return;
    }
    handleFrame(frame);
  });

  ws.addEventListener('close', () => {
    setConnectionState(false);
    scheduleReconnect();
  });

  ws.addEventListener('error', () => {
    ws.close();
  });
}

function scheduleReconnect() {
  const delay = state.wsBackoff;
  state.wsBackoff = Math.min(state.wsBackoff * 2, MAX_BACKOFF_MS);
  setTimeout(connectWebSocket, delay);
}

function handleFrame(frame) {
  switch (frame.type) {
    case 'welcome': {
      state.firstWelcomeReceived = true;
      state.rooms = frame.rooms;
      state.activeRoomId = frame.roomId;
      state.messages = frame.messages;
      state.online = frame.online;
      el.chatLoading.hidden = true;
      renderRoomList();
      renderTopbar();
      renderMessages(true);
      renderOnline();
      break;
    }
    case 'history': {
      if (frame.roomId !== state.activeRoomId) return;
      state.messages = frame.messages;
      state.online = frame.online;
      el.chatLoading.hidden = true;
      renderMessages(true);
      renderOnline();
      break;
    }
    case 'message': {
      const msg = frame.message;
      if (msg.roomId === state.activeRoomId) {
        state.messages.push(msg);
        renderMessages(false);
      } else {
        bumpUnread(msg.roomId);
      }
      if (state.rooms) {
        const room = state.rooms.find((r) => r.id === msg.roomId);
        if (room) room.messageCount = (room.messageCount || 0) + 1;
      }
      if (state.user && msg.userId !== state.user.id) {
        playBeep();
      }
      break;
    }
    case 'presence': {
      if (frame.roomId !== state.activeRoomId) return;
      state.online = frame.online;
      renderOnline();
      break;
    }
    case 'typing': {
      if (frame.roomId !== state.activeRoomId) return;
      if (state.user && frame.userId === state.user.id) return;
      setTypingUser(frame.userId, frame.userName, frame.isTyping);
      break;
    }
    case 'reaction': {
      if (frame.roomId === state.activeRoomId) {
        updateMessageReactions(frame.messageId, frame.reactions);
      }
      break;
    }
    case 'room': {
      state.rooms.push(frame.room);
      renderRoomList();
      break;
    }
    case 'error': {
      console.error('Server error:', frame.message);
      break;
    }
    case 'pong':
    default:
      break;
  }
}

// ---- boot ----

function enterShell() {
  el.joinScreen.hidden = true;
  el.shell.hidden = false;
  renderProfileChip();
  renderRoute();
  connectWebSocket();
}

function boot() {
  state.theme = localStorage.getItem(LS_THEME) || 'light';
  state.sound = localStorage.getItem(LS_SOUND) || 'on';
  state.unread = loadJson(LS_UNREAD, {});
  applyTheme(state.theme);
  applySound(state.sound);

  initSearch();
  initCreateRoom();
  initComposer();
  initNavigation();
  initSettings();

  const storedUser = loadJson(LS_USER, null);
  if (storedUser && storedUser.id && storedUser.name && storedUser.color) {
    state.user = storedUser;
    el.joinScreen.hidden = true;
    enterShell();
  } else {
    el.shell.hidden = true;
    el.joinScreen.hidden = false;
    initJoinScreen();
  }
}

boot();
