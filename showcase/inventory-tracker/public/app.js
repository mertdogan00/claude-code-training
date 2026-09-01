'use strict';

const state = { products: [], movements: [], search: '', category: '' };

const productListEl = document.getElementById('product-list');
const movementListEl = document.getElementById('movement-list');
const categoryFilterEl = document.getElementById('category-filter');
const searchInputEl = document.getElementById('search-input');
const formEl = document.getElementById('product-form');
const formErrorEl = document.getElementById('form-error');

const currency = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const timeFormat = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'short', timeStyle: 'short' });

async function api(url, options) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) {
    const message = Array.isArray(data.errors) ? data.errors.join(' ') : 'Sunucu hatası.';
    throw new Error(message);
  }
  return data;
}

async function loadAll() {
  const [products, movements] = await Promise.all([
    api('/api/products'),
    api('/api/movements'),
  ]);
  state.products = products;
  state.movements = movements;
  renderCategoryOptions();
  renderSummary();
  renderProducts();
  renderMovements();
}

function isCritical(product) {
  return product.quantity <= product.critical_threshold;
}

function renderSummary() {
  const distinct = state.products.length;
  const totalValue = state.products.reduce((sum, p) => sum + p.quantity * p.unit_price, 0);
  const criticalCount = state.products.filter(isCritical).length;

  document.getElementById('summary-count').textContent = distinct;
  document.getElementById('summary-value').textContent = `${currency.format(totalValue)} ₺`;
  document.getElementById('summary-critical').textContent = criticalCount;
}

function renderCategoryOptions() {
  const categories = [...new Set(state.products.map((p) => p.category))].sort((a, b) =>
    a.localeCompare(b, 'tr')
  );
  const current = categoryFilterEl.value;
  categoryFilterEl.innerHTML = '<option value="">Tüm kategoriler</option>';
  for (const category of categories) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilterEl.appendChild(option);
  }
  categoryFilterEl.value = categories.includes(current) ? current : '';
}

function filteredProducts() {
  const search = state.search.trim().toLocaleLowerCase('tr');
  return state.products.filter((p) => {
    const matchesSearch = !search || p.name.toLocaleLowerCase('tr').includes(search);
    const matchesCategory = !state.category || p.category === state.category;
    return matchesSearch && matchesCategory;
  });
}

function renderProducts() {
  const list = filteredProducts();
  const critical = list.filter(isCritical);
  const normal = list.filter((p) => !isCritical(p));

  productListEl.innerHTML = '';

  if (list.length === 0) {
    const note = document.createElement('p');
    note.className = 'empty-note';
    note.textContent = 'Eşleşen ürün yok.';
    productListEl.appendChild(note);
    return;
  }

  for (const product of [...critical, ...normal]) {
    productListEl.appendChild(buildProductRow(product));
  }
}

function buildProductRow(product) {
  const row = document.createElement('div');
  row.className = 'product-row' + (isCritical(product) ? ' critical' : '');

  const main = document.createElement('div');
  main.className = 'product-main';

  const name = document.createElement('div');
  name.className = 'product-name';
  name.textContent = product.name;
  main.appendChild(name);

  const meta = document.createElement('div');
  meta.className = 'product-meta';
  meta.textContent = `${product.category} • Eşik: ${product.critical_threshold} • Birim: ${currency.format(product.unit_price)} ₺`;
  main.appendChild(meta);

  if (isCritical(product)) {
    const badge = document.createElement('span');
    badge.className = 'badge-order';
    badge.textContent = 'Sipariş Ver';
    main.appendChild(document.createElement('br'));
    main.appendChild(badge);
  }

  row.appendChild(main);

  const controls = document.createElement('div');
  controls.className = 'qty-controls';

  const minusBtn = document.createElement('button');
  minusBtn.type = 'button';
  minusBtn.className = 'qty-btn';
  minusBtn.textContent = '-';
  minusBtn.disabled = product.quantity <= 0;
  minusBtn.addEventListener('click', () => stepQuantity(product.id, 'decrement'));

  const qtyValue = document.createElement('span');
  qtyValue.className = 'qty-value';
  qtyValue.textContent = product.quantity;

  const plusBtn = document.createElement('button');
  plusBtn.type = 'button';
  plusBtn.className = 'qty-btn';
  plusBtn.textContent = '+';
  plusBtn.addEventListener('click', () => stepQuantity(product.id, 'increment'));

  controls.append(minusBtn, qtyValue, plusBtn);
  row.appendChild(controls);

  return row;
}

async function stepQuantity(id, direction) {
  try {
    await api(`/api/products/${id}/${direction}`, { method: 'POST' });
    await loadAll();
  } catch (err) {
    formErrorEl.textContent = err.message;
    formErrorEl.hidden = false;
  }
}

function renderMovements() {
  movementListEl.innerHTML = '';
  if (state.movements.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Henüz hareket yok.';
    movementListEl.appendChild(li);
    return;
  }
  for (const movement of state.movements) {
    const li = document.createElement('li');

    const label = document.createElement('span');
    const when = timeFormat.format(new Date(movement.created_at.replace(' ', 'T') + 'Z'));
    label.textContent = `${when} • ${movement.product_name}`;

    const change = document.createElement('span');
    change.className = 'movement-change ' + (movement.change >= 0 ? 'positive' : 'negative');
    change.textContent = movement.change >= 0 ? `+${movement.change}` : `${movement.change}`;

    li.append(label, change);
    movementListEl.appendChild(li);
  }
}

formEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  formErrorEl.hidden = true;

  const formData = new FormData(formEl);
  const payload = {
    name: formData.get('name'),
    category: formData.get('category'),
    quantity: formData.get('quantity'),
    criticalThreshold: formData.get('criticalThreshold'),
    unitPrice: formData.get('unitPrice'),
  };

  const clientErrors = validateClientSide(payload);
  if (clientErrors.length > 0) {
    formErrorEl.textContent = clientErrors.join(' ');
    formErrorEl.hidden = false;
    return;
  }

  try {
    await api('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    formEl.reset();
    await loadAll();
  } catch (err) {
    formErrorEl.textContent = err.message;
    formErrorEl.hidden = false;
  }
});

function validateClientSide({ name, category, quantity, unitPrice }) {
  const errors = [];
  if (!name || !name.trim()) errors.push('Ürün adı gerekli.');
  if (!category || !category.trim()) errors.push('Kategori gerekli.');
  if (quantity === '' || Number(quantity) < 0 || !Number.isInteger(Number(quantity))) {
    errors.push('Miktar sıfır veya pozitif bir tam sayı olmalı.');
  }
  if (unitPrice === '' || Number(unitPrice) < 0) {
    errors.push('Birim fiyat sıfır veya pozitif bir sayı olmalı.');
  }
  return errors;
}

searchInputEl.addEventListener('input', () => {
  state.search = searchInputEl.value;
  renderProducts();
});

categoryFilterEl.addEventListener('change', () => {
  state.category = categoryFilterEl.value;
  renderProducts();
});

loadAll().catch((err) => {
  formErrorEl.textContent = err.message;
  formErrorEl.hidden = false;
});
