// Satis Analitik Paneli - frontend state, fetches, charts, table, filters

const state = {
  from: '',
  to: '',
  category: '',
  city: '',
  granularity: 'day',
};

const tableState = {
  sortKey: 'revenue',
  sortDir: 'desc',
  search: '',
  items: [],
};

const currencyFmt = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFmt = new Intl.NumberFormat('tr-TR', {
  maximumFractionDigits: 0,
});

function formatMoney(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return currencyFmt.format(value);
}

function formatCount(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return numberFmt.format(value);
}

function formatChange(value) {
  if (value === null || value === undefined) return '-';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1).replace('.', ',')}%`;
}

function buildQuery(extra) {
  const params = new URLSearchParams();
  if (state.from) params.set('from', state.from);
  if (state.to) params.set('to', state.to);
  if (state.category) params.set('category', state.category);
  if (state.city) params.set('city', state.city);
  if (extra) {
    for (const key of Object.keys(extra)) {
      if (extra[key]) params.set(key, extra[key]);
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function fetchJson(url) {
  const res = await fetch(url);
  return res.json();
}

let timelineChart = null;
let categoryChart = null;
let cityChart = null;

const CATEGORY_COLORS = [
  '#E2643C', '#43C08A', '#5B8DEF', '#E2B33C', '#B15BE2',
  '#3CC7E2', '#E23C7E', '#8DE23C', '#9AA3AF', '#E29C3C',
];

function categoryColor(index) {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

async function loadMeta() {
  const meta = await fetchJson('/api/meta');
  const categorySelect = document.getElementById('category-select');
  const citySelect = document.getElementById('city-select');

  for (const category of meta.categories) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  }

  for (const city of meta.cities) {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    citySelect.appendChild(option);
  }

  if (meta.dateRange && meta.dateRange.min && meta.dateRange.max) {
    const fromInput = document.getElementById('from-date');
    const toInput = document.getElementById('to-date');
    fromInput.min = meta.dateRange.min;
    fromInput.max = meta.dateRange.max;
    toInput.min = meta.dateRange.min;
    toInput.max = meta.dateRange.max;

    const maxDate = new Date(`${meta.dateRange.max}T00:00:00Z`);
    const defaultFrom = new Date(maxDate);
    defaultFrom.setUTCDate(defaultFrom.getUTCDate() - 13);
    const defaultFromStr = defaultFrom.toISOString().slice(0, 10);

    state.from = defaultFromStr < meta.dateRange.min ? meta.dateRange.min : defaultFromStr;
    state.to = meta.dateRange.max;
    fromInput.value = state.from;
    toInput.value = state.to;
  }
}

async function loadKpis() {
  const data = await fetchJson(`/api/kpis${buildQuery()}`);
  const map = {
    revenue: { value: data.current.revenue, change: data.change.revenue, fmt: formatMoney },
    units: { value: data.current.units, change: data.change.units, fmt: formatCount },
    orders: { value: data.current.orders, change: data.change.orders, fmt: formatCount },
    avgBasket: { value: data.current.avgBasket, change: data.change.avgBasket, fmt: formatMoney },
  };

  for (const key of Object.keys(map)) {
    const { value, change, fmt } = map[key];
    document.getElementById(`kpi-${key}-value`).textContent = fmt(value);
    const changeEl = document.getElementById(`kpi-${key}-change`);
    const subEl = document.getElementById(`kpi-${key}-sub`);
    changeEl.classList.remove('positive', 'negative');
    if (change === null || change === undefined) {
      changeEl.textContent = '';
      subEl.textContent = 'önceki dönem verisi yok';
    } else {
      changeEl.textContent = formatChange(change);
      changeEl.classList.add(change >= 0 ? 'positive' : 'negative');
      subEl.textContent = 'önceki döneme göre';
    }
  }
}

async function loadTimeline() {
  const data = await fetchJson(`/api/timeline${buildQuery({ granularity: state.granularity })}`);
  const labels = data.points.map((p) => p.label);
  const revenues = data.points.map((p) => p.revenue);
  const pointRadius = data.points.length <= 1 ? 5 : 0;

  const canvas = document.getElementById('timeline-chart');
  const ctx = canvas.getContext('2d');

  if (timelineChart) {
    timelineChart.data.labels = labels;
    timelineChart.data.datasets[0].data = revenues;
    timelineChart.data.datasets[0].pointRadius = pointRadius;
    timelineChart.update();
    return;
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, 260);
  gradient.addColorStop(0, 'rgba(226, 100, 60, 0.35)');
  gradient.addColorStop(1, 'rgba(226, 100, 60, 0.02)');

  timelineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Gelir',
        data: revenues,
        borderColor: '#E2643C',
        backgroundColor: gradient,
        fill: true,
        tension: 0.35,
        pointRadius,
        pointBackgroundColor: '#E2643C',
        pointHoverRadius: 5,
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => `Gelir: ${formatMoney(item.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#9AA3AF', maxRotation: 0, autoSkip: true },
        },
        y: {
          grid: { color: '#252A33' },
          ticks: {
            color: '#9AA3AF',
            callback: (value) => formatCount(value),
          },
        },
      },
    },
  });
}

async function loadCategories() {
  const data = await fetchJson(`/api/categories${buildQuery()}`);
  const canvas = document.getElementById('category-chart');
  const ctx = canvas.getContext('2d');

  const labels = data.items.map((i) => i.category);
  const values = data.items.map((i) => i.revenue);
  const colors = data.items.map((_, idx) => categoryColor(idx));

  if (categoryChart) {
    categoryChart.data.labels = labels;
    categoryChart.data.datasets[0].data = values;
    categoryChart.data.datasets[0].backgroundColor = colors;
    categoryChart.update();
  } else {
    categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: '#171A21',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => {
                const entry = data.items[item.dataIndex];
                return `${entry.category}: ${formatMoney(entry.revenue)} (%${entry.share.toFixed(1).replace('.', ',')})`;
              },
            },
          },
        },
        onClick: (evt, elements) => {
          if (!elements.length) return;
          const idx = elements[0].index;
          const clicked = data.items[idx].category;
          state.category = state.category === clicked ? '' : clicked;
          document.getElementById('category-select').value = state.category;
          refreshAll();
        },
      },
    });
  }

  const legend = document.getElementById('category-legend');
  legend.innerHTML = '';
  data.items.forEach((item, idx) => {
    const li = document.createElement('li');
    if (state.category === item.category) li.classList.add('active');
    li.innerHTML = `
      <span class="swatch" style="background:${categoryColor(idx)}"></span>
      <span class="legend-name">${item.category}</span>
      <span class="legend-share">%${item.share.toFixed(1).replace('.', ',')}</span>
    `;
    li.addEventListener('click', () => {
      state.category = state.category === item.category ? '' : item.category;
      document.getElementById('category-select').value = state.category;
      refreshAll();
    });
    legend.appendChild(li);
  });
}

async function loadCities() {
  const data = await fetchJson(`/api/cities${buildQuery()}`);
  const canvas = document.getElementById('city-chart');
  const ctx = canvas.getContext('2d');

  const labels = data.items.map((i) => i.city);
  const revenues = data.items.map((i) => i.revenue);
  const units = data.items.map((i) => i.units);

  if (cityChart) {
    cityChart.data.labels = labels;
    cityChart.data.datasets[0].data = revenues;
    cityChart.data.datasets[0].units = units;
    cityChart.update();
    return;
  }

  cityChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Gelir',
        data: revenues,
        units,
        backgroundColor: '#E2643C',
        borderRadius: 6,
        maxBarThickness: 28,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => {
              const u = item.dataset.units[item.dataIndex];
              return [`Gelir: ${formatMoney(item.parsed.y)}`, `Adet: ${formatCount(u)}`];
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#9AA3AF', maxRotation: 0, autoSkip: true },
        },
        y: {
          grid: { color: '#252A33' },
          ticks: {
            color: '#9AA3AF',
            callback: (value) => formatCount(value),
          },
        },
      },
    },
  });
}

async function loadInsights() {
  const data = await fetchJson(`/api/insights${buildQuery()}`);
  const list = document.getElementById('insight-list');
  list.innerHTML = '';

  if (!data.insights || !data.insights.length) {
    const li = document.createElement('li');
    li.className = 'insight-item';
    li.innerHTML = '<p class="insight-text">Bu filtre için iç görüş bulunamadı.</p>';
    list.appendChild(li);
    return;
  }

  for (const insight of data.insights) {
    const li = document.createElement('li');
    li.className = 'insight-item';
    li.innerHTML = `
      <p class="insight-title">${insight.title}</p>
      <p class="insight-text">${insight.text}</p>
      <div class="insight-value-row">
        <p class="insight-value">
          <span class="insight-value-figure">${insight.valueLabel}</span>
        </p>
      </div>
    `;
    list.appendChild(li);
  }
}

async function loadProducts() {
  const data = await fetchJson(`/api/products${buildQuery()}`);
  tableState.items = data.items;
  renderTable();
}

function renderTable() {
  const body = document.getElementById('product-table-body');
  body.innerHTML = '';

  const search = tableState.search.trim().toLowerCase();
  let rows = tableState.items.filter((item) => {
    if (!search) return true;
    return item.product.toLowerCase().includes(search) || item.category.toLowerCase().includes(search);
  });

  const { sortKey, sortDir } = tableState;
  rows = rows.slice().sort((a, b) => {
    let av = a[sortKey];
    let bv = b[sortKey];
    if (typeof av === 'string') {
      av = av.toLowerCase();
      bv = bv.toLowerCase();
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  if (!rows.length) {
    const tr = document.createElement('tr');
    tr.className = 'empty-row';
    tr.innerHTML = '<td colspan="6">Sonuç bulunamadı</td>';
    body.appendChild(tr);
    return;
  }

  for (const item of rows) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.product}</td>
      <td>${item.category}</td>
      <td>${formatMoney(item.revenue)}</td>
      <td>${formatCount(item.units)}</td>
      <td>${formatCount(item.orders)}</td>
      <td>%${item.share.toFixed(1).replace('.', ',')}</td>
    `;
    body.appendChild(tr);
  }

  document.querySelectorAll('#product-table th').forEach((th) => {
    th.classList.remove('sorted-asc', 'sorted-desc');
    if (th.dataset.sort === sortKey) {
      th.classList.add(sortDir === 'asc' ? 'sorted-asc' : 'sorted-desc');
    }
  });
}

async function refreshAll() {
  await Promise.all([
    loadKpis(),
    loadTimeline(),
    loadCategories(),
    loadCities(),
    loadInsights(),
    loadProducts(),
  ]);
}

function wireFilterBar() {
  const fromInput = document.getElementById('from-date');
  const toInput = document.getElementById('to-date');
  const categorySelect = document.getElementById('category-select');
  const citySelect = document.getElementById('city-select');
  const resetBtn = document.getElementById('reset-filters');

  fromInput.addEventListener('change', () => {
    state.from = fromInput.value;
    refreshAll();
  });

  toInput.addEventListener('change', () => {
    state.to = toInput.value;
    refreshAll();
  });

  categorySelect.addEventListener('change', () => {
    state.category = categorySelect.value;
    refreshAll();
  });

  citySelect.addEventListener('change', () => {
    state.city = citySelect.value;
    refreshAll();
  });

  resetBtn.addEventListener('click', () => {
    state.from = '';
    state.to = '';
    state.category = '';
    state.city = '';
    fromInput.value = '';
    toInput.value = '';
    categorySelect.value = '';
    citySelect.value = '';
    refreshAll();
  });
}

function wireGranularitySwitch() {
  const buttons = document.querySelectorAll('#granularity-switch button');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.granularity = btn.dataset.granularity;
      buttons.forEach((b) => b.classList.toggle('active', b === btn));
      loadTimeline();
    });
  });
}

function wireProductTable() {
  const searchInput = document.getElementById('product-search');
  searchInput.addEventListener('input', () => {
    tableState.search = searchInput.value;
    renderTable();
  });

  document.querySelectorAll('#product-table th').forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (tableState.sortKey === key) {
        tableState.sortDir = tableState.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        tableState.sortKey = key;
        tableState.sortDir = 'desc';
      }
      renderTable();
    });
  });
}

async function init() {
  wireFilterBar();
  wireGranularitySwitch();
  wireProductTable();
  await loadMeta();
  await refreshAll();
}

init();
