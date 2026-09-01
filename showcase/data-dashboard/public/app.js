// Frontend only renders what the API returns; no aggregation happens here.
async function fetchJson(url) {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Bilinmeyen hata');
  }
  return data;
}

function formatNumberTr(value) {
  return Math.round(value).toLocaleString('tr-TR');
}

function formatCurrencyTr(value) {
  return `${formatNumberTr(value)} TL`;
}

function showErrorBanner(message) {
  const banner = document.getElementById('error-banner');
  banner.textContent = `Veri yüklenemedi: ${message}`;
  banner.hidden = false;
}

function renderSummary(summary) {
  document.getElementById('card-total-revenue').textContent = formatCurrencyTr(summary.totalRevenue);
  document.getElementById('card-total-units').textContent = `${formatNumberTr(summary.totalUnits)} adet`;

  if (summary.bestProduct) {
    document.getElementById('card-best-product').textContent = summary.bestProduct.name;
    document.getElementById('card-best-product-sub').textContent = formatCurrencyTr(summary.bestProduct.revenue);
  }
  if (summary.strongestCity) {
    document.getElementById('card-strongest-city').textContent = summary.strongestCity.name;
    document.getElementById('card-strongest-city-sub').textContent = formatCurrencyTr(summary.strongestCity.revenue);
  }

  const footnote = document.getElementById('footnote');
  footnote.textContent =
    summary.skippedRows > 0
      ? `${summary.loadedRows} satır yüklendi, ${summary.skippedRows} satır hatalı olduğu için atlandı.`
      : `Tüm ${summary.loadedRows} satır başarıyla yüklendi.`;
}

function renderDaily(daily) {
  const container = document.getElementById('daily-chart');
  container.innerHTML = '';
  const max = Math.max(...daily.map((d) => d.revenue), 1);
  daily.forEach((d) => {
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.height = `${(d.revenue / max) * 100}%`;
    bar.title = `${d.date}: ${formatCurrencyTr(d.revenue)}`;
    container.appendChild(bar);
  });
}

function renderCategories(categories) {
  const container = document.getElementById('category-bars');
  container.innerHTML = '';
  categories.forEach((c) => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `
      <div class="bar-row-label">
        <span>${c.category}</span>
        <span>%${c.percentage.toFixed(1)}</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${c.percentage}%"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

function renderCities(cities) {
  const tbody = document.getElementById('city-table-body');
  tbody.innerHTML = '';
  cities.forEach((c) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.city}</td>
      <td>${formatCurrencyTr(c.revenue)}</td>
      <td>${formatNumberTr(c.units)}</td>
      <td>${formatCurrencyTr(c.avgBasket)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderInsight(insight) {
  const list = document.getElementById('insight-list');
  list.innerHTML = '';
  insight.observations.forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    list.appendChild(li);
  });
}

async function init() {
  try {
    const [summary, daily, categories, cities, insight] = await Promise.all([
      fetchJson('/api/summary'),
      fetchJson('/api/daily'),
      fetchJson('/api/categories'),
      fetchJson('/api/cities'),
      fetchJson('/api/insight'),
    ]);
    renderSummary(summary);
    renderDaily(daily);
    renderCategories(categories);
    renderCities(cities);
    renderInsight(insight);
  } catch (err) {
    showErrorBanner(err.message);
  }
}

init();
