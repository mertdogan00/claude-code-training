const tabsEl = document.getElementById('tabs');
const productsEl = document.getElementById('products');

let categories = [];
let products = [];
let activeCategoryId = null;

async function load() {
  const [categoriesRes, productsRes] = await Promise.all([
    fetch('/api/categories'),
    fetch('/api/products')
  ]);
  categories = await categoriesRes.json();
  products = await productsRes.json();
  activeCategoryId = categories[0]?.id ?? null;
  renderTabs();
  renderProducts();
}

function renderTabs() {
  tabsEl.innerHTML = '';
  for (const category of categories) {
    const btn = document.createElement('button');
    btn.className = 'tab' + (category.id === activeCategoryId ? ' active' : '');
    btn.textContent = category.name;
    btn.addEventListener('click', () => {
      activeCategoryId = category.id;
      renderTabs();
      renderProducts();
    });
    tabsEl.appendChild(btn);
  }
}

function formatPrice(price) {
  return `${price.toFixed(2).replace(/\.00$/, '')} ₺`;
}

function renderProducts() {
  const list = products.filter((p) => p.category_id === activeCategoryId);
  productsEl.innerHTML = '';

  if (list.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Bu kategoride ürün yok.';
    productsEl.appendChild(empty);
    return;
  }

  for (const product of list) {
    const card = document.createElement('article');
    card.className = 'card' + (product.sold_out ? ' sold-out' : '');

    const info = document.createElement('div');
    info.className = 'card-info';
    const title = document.createElement('h2');
    title.textContent = product.name;
    const desc = document.createElement('p');
    desc.textContent = product.description;
    info.appendChild(title);
    info.appendChild(desc);

    const priceBox = document.createElement('div');
    priceBox.className = 'card-price';
    const price = document.createElement('span');
    price.className = 'price';
    price.textContent = formatPrice(product.price);
    priceBox.appendChild(price);
    if (product.sold_out) {
      const badge = document.createElement('span');
      badge.className = 'badge-sold-out';
      badge.textContent = 'tükendi';
      priceBox.appendChild(badge);
    }

    card.appendChild(info);
    card.appendChild(priceBox);
    productsEl.appendChild(card);
  }
}

load();
