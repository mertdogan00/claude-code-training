/* Satis Analitik Paneli, front end. One state object drives every screen. */

const RATES = {
  TL: { rate: 1, symbol: '₺' },
  USD: { rate: 0.0241, symbol: '$' },
  EUR: { rate: 0.0222, symbol: '€' }
};

const SCREEN_TITLES = {
  overview: ['Genel bakış', 'Seçili döneme ait özet'],
  products: ['Ürünler', 'Ciroya göre ürün performansı'],
  cities: ['Şehirler', 'Ciroya göre şehir dağılımı'],
  settings: ['Ayarlar', 'Tema, para birimi, hedef ve veri']
};

const ROUTES = { overview: 'genel-bakis', products: 'urunler', cities: 'sehirler', settings: 'ayarlar' };
const SCREEN_BY_ROUTE = Object.fromEntries(Object.entries(ROUTES).map(([k, v]) => [v, k]));

const DEFAULTS = { theme: 'dark', currency: 'TL', target: 400000 };
const STORE_KEY = 'sap.settings.v1';

const state = {
  screen: 'overview',
  settings: { ...DEFAULTS },
  filters: { from: '', to: '', category: '', city: '' },
  preset: 'all',
  granularity: 'day',
  search: '',
  sort: { key: 'revenue', dir: 'desc' },
  meta: null,
  data: {},
  loading: true
};

const charts = { timeline: null, donut: null, cities: null };
const $ = (id) => document.getElementById(id);

/* --------------------------------------------------------------- settings */

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) Object.assign(state.settings, JSON.parse(raw));
  } catch {
    // A blocked or empty storage just means the defaults stay.
  }
}

function saveSettings() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state.settings));
  } catch {
    // Nothing to do, the session keeps working with in-memory settings.
  }
}

/* -------------------------------------------------------------- formatting */

function money(valueTl) {
  const c = RATES[state.settings.currency] || RATES.TL;
  const converted = valueTl * c.rate;
  const decimals = converted < 100 && converted > 0 ? 2 : 0;
  return `${c.symbol}${converted.toLocaleString('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}

const count = (v) => Math.round(v).toLocaleString('tr-TR');
const percent = (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
const share = (v) => `%${v.toFixed(1)}`;

function themeColors() {
  const s = getComputedStyle(document.documentElement);
  return {
    accent: s.getPropertyValue('--accent').trim(),
    ink: s.getPropertyValue('--ink').trim(),
    muted: s.getPropertyValue('--muted').trim(),
    line: s.getPropertyValue('--line').trim(),
    surface: s.getPropertyValue('--surface').trim()
  };
}

function palette(n) {
  const base = ['#f0803c', '#3fb27f', '#5c8ce0', '#e0b341', '#b06fd8', '#e0604c'];
  return Array.from({ length: n }, (_, i) => base[i % base.length]);
}

function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { el.hidden = true; }, 2600);
}

/* ------------------------------------------------------------------ data */

function queryString(extra = {}) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...state.filters, ...extra })) {
    if (v) params.set(k, v);
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}

async function getJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} returned ${res.status}`);
  return res.json();
}

async function loadMeta() {
  state.meta = await getJson('/api/meta');
  $('side-rows').textContent = count(state.meta.rows);
  const source = state.meta.source || '';
  const label = source.startsWith('csv:') ? 'repo CSV' : source === 'upload' ? 'yüklenen CSV' : 'üretilen veri';
  $('side-source').textContent = label;
  $('data-rows').textContent = `${count(state.meta.rows)} kayıt`;
  $('data-source').textContent = source.startsWith('csv:')
    ? `Depodaki sales-data.csv dosyasından yüklendi (${state.meta.dateRange.min} - ${state.meta.dateRange.max})`
    : source === 'upload'
      ? `Yüklenen CSV dosyasından (${state.meta.dateRange.min} - ${state.meta.dateRange.max})`
      : `Sunucu tarafında üretildi (${state.meta.dateRange.min} - ${state.meta.dateRange.max})`;
  fillSelect($('f-category'), state.meta.categories);
  fillSelect($('f-city'), state.meta.cities);
}

function fillSelect(el, values) {
  const current = el.value;
  el.innerHTML = '<option value="">Tümü</option>';
  for (const v of values) {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    el.appendChild(opt);
  }
  el.value = values.includes(current) ? current : '';
}

async function refresh() {
  state.loading = true;
  renderLoading();
  const q = queryString();
  const [kpis, timeline, categories, products, cities, insights] = await Promise.all([
    getJson(`/api/kpis${q}`),
    getJson(`/api/timeline${queryString({ granularity: state.granularity })}`),
    getJson(`/api/categories${q}`),
    getJson(`/api/products${q}`),
    getJson(`/api/cities${q}`),
    getJson(`/api/insights${q}`)
  ]);
  state.data = { kpis, timeline, categories, products, cities, insights };
  state.loading = false;
  renderAll();
}

/* --------------------------------------------------------------- rendering */

function renderLoading() {
  const grid = $('kpi-grid');
  if (grid.children.length === 0) {
    grid.innerHTML = Array.from({ length: 4 }, () =>
      '<article class="kpi is-loading"><span class="kpi-label">.</span><span class="kpi-value">.</span><span class="delta">.</span><div class="skeleton" style="height:58px"></div></article>'
    ).join('');
  }
}

function renderAll() {
  renderKpis();
  renderTarget();
  renderTimeline();
  renderDonut();
  renderInsights();
  renderProducts();
  renderCities();
  renderFilterState();
}

function deltaClass(v) {
  if (v === null || Math.abs(v) < 0.05) return 'flat';
  return v > 0 ? 'up' : 'down';
}

function deltaText(v) {
  return v === null
    ? '<span title="Seçili aralıktan önce veri yok">önceki dönem yok</span>'
    : `${percent(v)} <small>önceki döneme göre</small>`;
}

function renderKpis() {
  const { current, change } = state.data.kpis;
  const cards = [
    { label: 'Ciro', value: money(current.revenue), change: change.revenue },
    { label: 'Satılan adet', value: count(current.units), change: change.units },
    { label: 'Sipariş sayısı', value: count(current.orders), change: change.orders },
    { label: 'Ortalama sepet', value: money(current.avgBasket), change: change.avgBasket }
  ];
  $('kpi-grid').innerHTML = cards.map((c) => `
    <article class="kpi">
      <span class="kpi-label">${c.label}</span>
      <span class="kpi-value">${c.value}</span>
      <span class="delta ${deltaClass(c.change)}">${deltaText(c.change)}</span>
    </article>`).join('');
}

function renderTarget() {
  const revenue = state.data.kpis.current.revenue;
  const target = Math.max(1, Number(state.settings.target) || DEFAULTS.target);
  const ratio = Math.min(revenue / target, 1);
  const reached = revenue >= target;
  $('target-current').textContent = money(revenue);
  $('target-total').textContent = `hedef ${money(target)}`;
  const bar = $('target-bar');
  bar.style.width = `${ratio * 100}%`;
  bar.classList.toggle('reached', reached);
  $('target-msg').textContent = reached
    ? `Hedef aşıldı. Seçili dönemde hedefin %${((revenue / target) * 100).toFixed(0)} kadarına ulaşıldı.`
    : `Hedefin %${((revenue / target) * 100).toFixed(0)} kadarı tamamlandı, kalan ${money(target - revenue)}.`;
}

function destroyChart(key) {
  if (charts[key]) { charts[key].destroy(); charts[key] = null; }
}

function renderTimeline() {
  const points = state.data.timeline.points;
  const box = $('chart-timeline').parentElement;
  const empty = $('empty-timeline');
  box.hidden = points.length === 0;
  empty.hidden = points.length > 0;
  destroyChart('timeline');
  if (points.length === 0) return;
  const c = themeColors();
  const rate = (RATES[state.settings.currency] || RATES.TL).rate;
  charts.timeline = new Chart($('chart-timeline'), {
    type: 'line',
    data: {
      labels: points.map((p) => p.bucket),
      datasets: [{
        label: 'Ciro',
        data: points.map((p) => p.revenue * rate),
        borderColor: c.accent,
        backgroundColor: 'rgba(240, 128, 60, 0.14)',
        fill: true,
        tension: 0.32,
        pointRadius: points.length > 20 ? 0 : 3,
        pointHoverRadius: 5,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `Ciro: ${money(points[ctx.dataIndex].revenue)}`,
            afterLabel: (ctx) => `Adet: ${count(points[ctx.dataIndex].units)}`
          }
        }
      },
      scales: {
        x: { grid: { color: c.line }, ticks: { color: c.muted, maxRotation: 0, autoSkipPadding: 18 } },
        y: { grid: { color: c.line }, ticks: { color: c.muted, callback: (v) => money(v / rate) } }
      }
    }
  });
}

function renderDonut() {
  const items = state.data.categories.items;
  const box = $('chart-donut').parentElement;
  const empty = $('empty-donut');
  box.hidden = items.length === 0;
  empty.hidden = items.length > 0;
  $('donut-legend').innerHTML = '';
  destroyChart('donut');
  if (items.length === 0) return;
  const colors = palette(items.length);
  const c = themeColors();
  charts.donut = new Chart($('chart-donut'), {
    type: 'doughnut',
    data: {
      labels: items.map((i) => i.category),
      datasets: [{ data: items.map((i) => i.revenue), backgroundColor: colors, borderColor: c.surface, borderWidth: 2 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '58%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${money(ctx.raw)} (${share(items[ctx.dataIndex].share)})` } }
      },
      onClick: (_e, els) => { if (els.length) applyCategory(items[els[0].index].category); }
    }
  });
  $('donut-legend').innerHTML = items.map((i, idx) => `
    <li data-category="${i.category}">
      <span class="dot" style="background:${colors[idx]}"></span>
      <span class="lg-name">${i.category}</span>
      <span class="lg-val">${share(i.share)} · ${money(i.revenue)}</span>
    </li>`).join('');
}

function insightValue(item) {
  if (item.valueType === 'money') return money(item.value);
  if (item.valueType === 'percent') return percent(item.value);
  return count(item.value);
}

function renderInsights() {
  const items = state.data.insights.items;
  $('insights').innerHTML = items.length === 0
    ? '<div class="empty">Bu filtrelerle çıkarılacak bir bulgu yok.</div>'
    : items.map((i) => `
      <article class="insight ${i.tone}">
        <b>${i.title}</b>
        <span class="i-value">${insightValue(i)}</span>
        <p>${i.text}</p>
      </article>`).join('');
  $('bell-badge').textContent = String(Math.min(items.length, 3));
  $('bell-list').innerHTML = items.slice(0, 3).map((i) => `
    <li><b>${i.title} · ${insightValue(i)}</b><span>${i.text}</span></li>`).join('')
    || '<li><span>Şu an gösterilecek bulgu yok.</span></li>';
}

function sortedProducts() {
  const term = state.search.trim().toLocaleLowerCase('tr');
  const rows = state.data.products.items.filter((p) => !term || p.product.toLocaleLowerCase('tr').includes(term));
  const { key, dir } = state.sort;
  const sign = dir === 'asc' ? 1 : -1;
  return rows.sort((a, b) =>
    typeof a[key] === 'string' ? sign * a[key].localeCompare(b[key], 'tr') : sign * (a[key] - b[key]));
}

function renderProducts() {
  const rows = sortedProducts();
  const max = rows.reduce((m, r) => Math.max(m, r.revenue), 0) || 1;
  $('empty-products').hidden = rows.length > 0;
  $('p-table').hidden = rows.length === 0;
  $('p-body').innerHTML = rows.map((r) => `
    <tr>
      <td>${r.product}</td>
      <td><span class="tag">${r.category}</span></td>
      <td class="num bar-cell">${money(r.revenue)}<i style="width:${(r.revenue / max) * 70}px"></i></td>
      <td class="num">${count(r.units)}</td>
      <td class="num">${count(r.orders)}</td>
      <td class="num">${share(r.share)}</td>
    </tr>`).join('');
  document.querySelectorAll('#p-table th').forEach((th) => {
    th.classList.toggle('is-sorted', th.dataset.sort === state.sort.key);
    th.classList.toggle('asc', th.dataset.sort === state.sort.key && state.sort.dir === 'asc');
  });
}

function renderCities() {
  const items = state.data.cities.items;
  const box = $('chart-cities').parentElement;
  box.hidden = items.length === 0;
  $('empty-cities').hidden = items.length > 0;
  $('c-body').innerHTML = items.map((i) => `
    <tr><td>${i.city}</td><td class="num">${money(i.revenue)}</td><td class="num">${count(i.units)}</td><td class="num">${share(i.share)}</td></tr>`
  ).join('');
  destroyChart('cities');
  if (items.length === 0) return;
  const c = themeColors();
  const rate = (RATES[state.settings.currency] || RATES.TL).rate;
  charts.cities = new Chart($('chart-cities'), {
    type: 'bar',
    data: {
      labels: items.map((i) => i.city),
      datasets: [{ data: items.map((i) => i.revenue * rate), backgroundColor: c.accent, borderRadius: 6, maxBarThickness: 54 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `Ciro: ${money(items[ctx.dataIndex].revenue)}`,
            afterLabel: (ctx) => `Adet: ${count(items[ctx.dataIndex].units)} · Pay: ${share(items[ctx.dataIndex].share)}`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: c.muted } },
        y: { grid: { color: c.line }, ticks: { color: c.muted, callback: (v) => money(v / rate) } }
      }
    }
  });
}

function renderFilterState() {
  const active = Object.values(state.filters).some(Boolean);
  $('f-clear').hidden = !active;
  const parts = [];
  if (state.filters.from || state.filters.to) parts.push(`${state.filters.from || 'başlangıç'} - ${state.filters.to || 'bitiş'}`);
  if (state.filters.category) parts.push(state.filters.category);
  if (state.filters.city) parts.push(state.filters.city);
  const [, sub] = SCREEN_TITLES[state.screen];
  $('screen-sub').textContent = parts.length ? `Filtre: ${parts.join(' · ')}` : sub;
}

/* --------------------------------------------------------------- behaviour */

function applyTheme() {
  document.documentElement.dataset.theme = state.settings.theme;
  document.querySelectorAll('#set-theme button').forEach((b) =>
    b.classList.toggle('is-active', b.dataset.theme === state.settings.theme));
  document.querySelectorAll('#set-currency button').forEach((b) =>
    b.classList.toggle('is-active', b.dataset.currency === state.settings.currency));
  $('set-target').value = state.settings.target;
}

function screenFromHash() {
  return SCREEN_BY_ROUTE[location.hash.replace('#', '')] || 'overview';
}

function showScreen(name) {
  state.screen = name;
  if (location.hash !== `#${ROUTES[name]}`) location.hash = ROUTES[name];
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('is-active', s.id === `screen-${name}`));
  document.querySelectorAll('.nav-item').forEach((b) => b.classList.toggle('is-active', b.dataset.screen === name));
  const [title] = SCREEN_TITLES[name];
  $('screen-title').textContent = title;
  $('filterbar').hidden = name === 'settings';
  renderFilterState();
  window.scrollTo({ top: 0 });
  // A chart built on a hidden screen has no size yet, so it is measured on reveal.
  requestAnimationFrame(() => Object.values(charts).forEach((c) => c && c.resize()));
}

function presetRange(days) {
  const max = state.meta && state.meta.dateRange.max;
  if (!max) return { from: '', to: '' };
  const end = new Date(`${max}T00:00:00Z`);
  const start = new Date(end.getTime() - (days - 1) * 86400000);
  return { from: start.toISOString().slice(0, 10), to: max };
}

function applyPreset(value) {
  state.preset = value;
  if (value === 'all') { state.filters.from = ''; state.filters.to = ''; }
  else if (value !== 'custom') Object.assign(state.filters, presetRange(Number(value)));
  $('f-from').value = state.filters.from;
  $('f-to').value = state.filters.to;
  refresh();
}

function applyCategory(category) {
  state.filters.category = state.filters.category === category ? '' : category;
  $('f-category').value = state.filters.category;
  showScreen('overview');
  refresh();
  toast(state.filters.category ? `Kategori filtresi: ${category}` : 'Kategori filtresi kaldırıldı');
}

function bindEvents() {
  document.querySelectorAll('[data-screen]').forEach((el) =>
    el.addEventListener('click', () => { showScreen(el.dataset.screen); $('bell-menu').hidden = true; }));

  $('f-preset').addEventListener('change', (e) => applyPreset(e.target.value));
  for (const [id, key] of [['f-from', 'from'], ['f-to', 'to'], ['f-category', 'category'], ['f-city', 'city']]) {
    $(id).addEventListener('change', (e) => {
      state.filters[key] = e.target.value;
      if (key === 'from' || key === 'to') { state.preset = 'custom'; $('f-preset').value = 'custom'; }
      refresh();
    });
  }
  $('f-clear').addEventListener('click', () => {
    state.filters = { from: '', to: '', category: '', city: '' };
    state.preset = 'all';
    $('f-preset').value = 'all';
    $('f-from').value = '';
    $('f-to').value = '';
    $('f-category').value = '';
    $('f-city').value = '';
    refresh();
    toast('Filtreler temizlendi');
  });

  document.querySelectorAll('#granularity button').forEach((b) => b.addEventListener('click', () => {
    state.granularity = b.dataset.g;
    document.querySelectorAll('#granularity button').forEach((x) => x.classList.toggle('is-active', x === b));
    refresh();
  }));

  $('donut-legend').addEventListener('click', (e) => {
    const li = e.target.closest('li[data-category]');
    if (li) applyCategory(li.dataset.category);
  });

  $('p-search').addEventListener('input', (e) => { state.search = e.target.value; renderProducts(); });
  document.querySelectorAll('#p-table th[data-sort]').forEach((th) => th.addEventListener('click', () => {
    const key = th.dataset.sort;
    state.sort = state.sort.key === key
      ? { key, dir: state.sort.dir === 'desc' ? 'asc' : 'desc' }
      : { key, dir: key === 'product' || key === 'category' ? 'asc' : 'desc' };
    renderProducts();
  }));

  $('bell').addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = $('bell-menu');
    menu.hidden = !menu.hidden;
    $('bell').setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.bell-wrap')) $('bell-menu').hidden = true;
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $('bell-menu').hidden = true; });

  document.querySelectorAll('#set-theme button').forEach((b) => b.addEventListener('click', () => {
    state.settings.theme = b.dataset.theme;
    saveSettings();
    applyTheme();
    renderAll();
    toast(`Tema: ${b.textContent}`);
  }));
  document.querySelectorAll('#set-currency button').forEach((b) => b.addEventListener('click', () => {
    state.settings.currency = b.dataset.currency;
    saveSettings();
    applyTheme();
    renderAll();
    toast(`Para birimi: ${state.settings.currency}`);
  }));
  $('set-target').addEventListener('input', (e) => {
    state.settings.target = Math.max(0, Number(e.target.value) || 0);
    saveSettings();
    renderTarget();
  });

  $('set-import').addEventListener('click', async () => {
    const note = $('import-note');
    const file = $('set-csv').files[0];
    if (!file) { note.className = 'note error'; note.textContent = 'Önce bir CSV dosyası seçin.'; return; }
    note.className = 'note';
    note.textContent = 'Yükleniyor...';
    try {
      const csv = await file.text();
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv })
      });
      const out = await res.json();
      if (!out.ok) throw new Error(out.error || 'İçe aktarma başarısız');
      note.textContent = `${out.rows} satır içe aktarıldı.`;
      await loadMeta();
      await refresh();
      toast('Veri seti değiştirildi');
    } catch (err) {
      note.className = 'note error';
      note.textContent = `Hata: ${err.message}`;
    }
  });
}

async function start() {
  loadSettings();
  applyTheme();
  bindEvents();
  showScreen(screenFromHash());
  window.addEventListener('hashchange', () => showScreen(screenFromHash()));
  renderLoading();
  try {
    await loadMeta();
    await refresh();
  } catch (err) {
    $('kpi-grid').innerHTML = `<div class="empty">Veri yüklenemedi: ${err.message}</div>`;
  }
}

start();
