const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const categoryForm = document.getElementById('category-form');
const productForm = document.getElementById('product-form');
const productError = document.getElementById('product-error');
const productCategorySelect = document.getElementById('product-category');
const productListEl = document.getElementById('product-list');

let categories = [];
let products = [];
let editingId = null;

function show(view) {
  loginView.hidden = view !== 'login';
  dashboardView.hidden = view !== 'dashboard';
}

async function checkSession() {
  const res = await fetch('/api/session');
  const { authenticated } = await res.json();
  if (authenticated) {
    show('dashboard');
    await loadData();
  } else {
    show('login');
  }
}

async function loadData() {
  const [categoriesRes, productsRes] = await Promise.all([
    fetch('/api/categories'),
    fetch('/api/products')
  ]);
  categories = await categoriesRes.json();
  products = await productsRes.json();
  renderCategoryOptions();
  renderProducts();
}

function renderCategoryOptions() {
  productCategorySelect.innerHTML = categories
    .map((c) => `<option value="${c.id}">${c.name}</option>`)
    .join('');
}

function categoryName(id) {
  return categories.find((c) => c.id === id)?.name ?? '';
}

function formatPrice(price) {
  return `${price.toFixed(2).replace(/\.00$/, '')} ₺`;
}

function renderProducts() {
  productListEl.innerHTML = '';
  for (const product of products) {
    productListEl.appendChild(
      product.id === editingId ? renderEditRow(product) : renderRow(product)
    );
  }
}

function renderRow(product) {
  const row = document.createElement('div');
  row.className = 'product-row' + (product.sold_out ? ' sold-out' : '');
  row.innerHTML = `
    <span class="name">${product.name} <small>(${categoryName(product.category_id)})</small></span>
    <span class="price">${formatPrice(product.price)}</span>
    <div class="actions">
      <button data-action="toggle" class="btn-secondary">${
        product.sold_out ? 'Stoğa ekle' : 'Tükendi yap'
      }</button>
      <button data-action="edit" class="btn-secondary">Düzenle</button>
      <button data-action="delete" class="btn-danger">Sil</button>
    </div>
  `;

  row.querySelector('[data-action="toggle"]').addEventListener('click', () =>
    updateProduct(product.id, { soldOut: !product.sold_out })
  );
  row.querySelector('[data-action="edit"]').addEventListener('click', () => {
    editingId = product.id;
    renderProducts();
  });
  row.querySelector('[data-action="delete"]').addEventListener('click', () =>
    deleteProduct(product.id)
  );

  return row;
}

function renderEditRow(product) {
  const row = document.createElement('div');
  row.className = 'product-row';
  row.innerHTML = `
    <input type="text" class="edit-name" value="${product.name}" />
    <input type="number" class="edit-price" value="${product.price}" min="0.01" step="0.01" />
    <select class="edit-category">
      ${categories
        .map(
          (c) =>
            `<option value="${c.id}" ${c.id === product.category_id ? 'selected' : ''}>${c.name}</option>`
        )
        .join('')}
    </select>
    <div class="actions">
      <button data-action="save" class="btn-secondary">Kaydet</button>
      <button data-action="cancel" class="btn-secondary">İptal</button>
    </div>
  `;

  row.querySelector('[data-action="save"]').addEventListener('click', () => {
    const name = row.querySelector('.edit-name').value.trim();
    const price = Number(row.querySelector('.edit-price').value);
    const categoryId = Number(row.querySelector('.edit-category').value);
    if (!name || !Number.isFinite(price) || price <= 0) return;
    editingId = null;
    updateProduct(product.id, { name, price, categoryId });
  });
  row.querySelector('[data-action="cancel"]').addEventListener('click', () => {
    editingId = null;
    renderProducts();
  });

  return row;
}

async function updateProduct(id, patch) {
  await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch)
  });
  await loadData();
}

async function deleteProduct(id) {
  await fetch(`/api/products/${id}`, { method: 'DELETE' });
  await loadData();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.hidden = true;
  const password = document.getElementById('password').value;
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (!res.ok) {
    const { error } = await res.json();
    loginError.textContent = error;
    loginError.hidden = false;
    return;
  }
  loginForm.reset();
  show('dashboard');
  await loadData();
});

logoutBtn.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  show('login');
});

categoryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('category-name');
  const name = input.value.trim();
  if (!name) return;
  await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  input.value = '';
  await loadData();
});

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  productError.hidden = true;

  const name = document.getElementById('product-name').value.trim();
  const description = document.getElementById('product-description').value.trim();
  const price = Number(document.getElementById('product-price').value);
  const categoryId = Number(productCategorySelect.value);

  if (!name) return showProductError('Ürün adı zorunludur.');
  if (!Number.isFinite(price) || price <= 0) return showProductError('Fiyat pozitif bir sayı olmalıdır.');

  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, price, categoryId })
  });

  if (!res.ok) {
    const { error } = await res.json();
    return showProductError(error);
  }

  productForm.reset();
  await loadData();
});

function showProductError(message) {
  productError.textContent = message;
  productError.hidden = false;
}

checkSession();
