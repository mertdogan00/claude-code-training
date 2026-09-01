/* QR Menu: single shared script for the customer face (index.html) and the admin face (admin.html). */
"use strict";

const TAGS = [
  { slug: "vegan", label: "Vegan" },
  { slug: "vejetaryen", label: "Vejetaryen" },
  { slug: "glutensiz", label: "Glutensiz" },
  { slug: "laktozsuz", label: "Laktozsuz" },
  { slug: "aci", label: "Acı" },
];

/* Each tag is a solid colour dot, same family, legible at 12px regardless of pill or chip state. */
const TAG_ICONS = {
  vegan: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#4a7c4e"/></svg>',
  vejetaryen: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#8aab3f"/></svg>',
  glutensiz: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#c9962c"/></svg>',
  laktozsuz: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#3f7fb0"/></svg>',
  aci: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#b5502e"/></svg>',
};

function fmtPrice(n) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n) + " ₺";
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function foldTr(s) {
  return String(s)
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function hueFromId(id) {
  const n = Number(id) || 0;
  const h1 = (n * 47) % 360;
  const h2 = (h1 + 40 + ((n * 13) % 30)) % 360;
  return [h1, h2];
}

function initials(name) {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function thumbStyle(id) {
  const [h1, h2] = hueFromId(id);
  return `background: linear-gradient(135deg, hsl(${h1}, 62%, 52%), hsl(${h2}, 58%, 40%));`;
}

/* ================= Customer face ================= */

function initCustomerPage() {
  const state = {
    version: null,
    data: null,
    search: "",
    activeTags: new Set(),
    order: loadOrder(),
    table: getTableParam(),
  };

  const root = document.getElementById("app");
  if (!root) return;

  if (state.table != null) {
    state.order.table = state.table;
    saveOrder(state.order);
  } else if (state.order.table != null) {
    state.table = state.order.table;
  }

  fetchMenu(state, root, true).then(() => {
    pollVersion(state, root);
  });
}

function getTableParam() {
  const params = new URLSearchParams(window.location.search);
  const masa = params.get("masa");
  if (!masa) return null;
  const n = parseInt(masa, 10);
  return Number.isFinite(n) ? n : null;
}

function loadOrder() {
  try {
    const raw = localStorage.getItem("qrmenu.order");
    if (!raw) return { table: null, lines: {} };
    const parsed = JSON.parse(raw);
    return {
      table: parsed.table != null ? parsed.table : null,
      lines: parsed.lines && typeof parsed.lines === "object" ? parsed.lines : {},
    };
  } catch (e) {
    return { table: null, lines: {} };
  }
}

function saveOrder(order) {
  localStorage.setItem("qrmenu.order", JSON.stringify(order));
}

async function fetchMenu(state, root, isFirstLoad) {
  const res = await fetch("/api/menu");
  const data = await res.json();
  state.data = data;
  state.version = data.version;
  renderCustomer(state, root, isFirstLoad);
}

function pollVersion(state, root) {
  setInterval(async () => {
    try {
      const res = await fetch("/api/version");
      const j = await res.json();
      if (j.version !== state.version) {
        const scrollY = window.scrollY;
        await fetchMenu(state, root, false);
        window.scrollTo(0, scrollY);
        showToast("menü güncellendi");
      }
    } catch (e) {
      /* network hiccup, try again next tick */
    }
  }, 3000);
}

function showToast(msg) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("visible");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("visible"), 3000);
}

function itemMatchesSearch(item, needle) {
  if (!needle) return true;
  const hay = foldTr(item.name + " " + item.description);
  return hay.includes(foldTr(needle));
}

function itemMatchesTags(item, activeTags) {
  if (activeTags.size === 0) return true;
  for (const t of activeTags) {
    if (!item.allergens.includes(t)) return false;
  }
  return true;
}

function renderCustomer(state, root, isFirstLoad) {
  const { data } = state;
  const restaurant = data.restaurant;

  const wasBuilt = root.dataset.built === "1";
  if (!wasBuilt) {
    root.innerHTML = buildCustomerShell(restaurant, state.table);
    root.dataset.built = "1";
    wireCustomerEvents(state, root);
  } else {
    root.querySelector(".menu-header h1").textContent = restaurant.name;
    root.querySelector(".menu-header .tagline").textContent = restaurant.tagline;
  }

  renderCategoryRail(state, root);
  renderMenuBody(state, root);
  updateOrderBar(state, root);
  if (isFirstLoad) setupScrollSpy(state, root);
}

function buildCustomerShell(restaurant, table) {
  const masaBadge = table != null ? `<div class="masa-badge">Masa ${table}</div>` : "";
  const orderPanelMasa = table != null ? `<div class="order-panel-masa">Masa ${table}</div>` : "";
  const chipsHtml = TAGS.map(
    (t) => `<button class="chip" data-tag="${t.slug}">${TAG_ICONS[t.slug]}<span>${t.label}</span></button>`
  ).join("");

  return `
    <header class="menu-header">
      <h1>${escapeHtml(restaurant.name)}</h1>
      <div class="tagline">${escapeHtml(restaurant.tagline)}</div>
      ${masaBadge}
    </header>
    <nav class="category-rail" id="category-rail"></nav>
    <div class="search-wrap">
      <div class="search-box">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" id="search-input" placeholder="Yemek ara..." autocomplete="off">
      </div>
    </div>
    <div class="chip-row" id="chip-row">${chipsHtml}</div>
    <main class="menu-body" id="menu-body"></main>
    <div class="order-bar" id="order-bar">
      <div>
        <div class="count" id="order-count">0 ürün</div>
        <div class="total" id="order-total">0,00 ₺</div>
      </div>
      <button type="button" class="btn btn-primary" style="flex:none;padding:10px 18px;" id="order-bar-open">Notu Gör</button>
    </div>
    <div class="order-panel" id="order-panel">
      <div class="backdrop" id="order-backdrop"></div>
      <div class="order-sheet">
        <div class="order-sheet-header">
          <h2>Sipariş Notu</h2>
          <button class="close-btn" id="order-close">✕</button>
        </div>
        ${orderPanelMasa}
        <div class="order-lines" id="order-lines"></div>
        <div class="order-summary">
          <span>Toplam</span>
          <span id="order-summary-total">0,00 ₺</span>
        </div>
        <div class="order-actions">
          <button class="btn btn-secondary" id="order-clear">Notu temizle</button>
          <button class="btn btn-primary" id="order-copy">Kopyala</button>
        </div>
      </div>
    </div>
  `;
}

function renderCategoryRail(state, root) {
  const rail = root.querySelector("#category-rail");
  const cats = [...state.data.categories].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
  rail.innerHTML = cats
    .map((c) => `<button class="category-pill" data-cat="${c.id}">${escapeHtml(c.name)}</button>`)
    .join("");
}

function renderMenuBody(state, root) {
  const body = root.querySelector("#menu-body");
  const cats = [...state.data.categories].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
  const items = [...state.data.items].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);

  const visibleByCat = {};
  let totalVisible = 0;
  for (const c of cats) {
    const catItems = items.filter(
      (it) => it.category_id === c.id && itemMatchesSearch(it, state.search) && itemMatchesTags(it, state.activeTags)
    );
    visibleByCat[c.id] = catItems;
    totalVisible += catItems.length;
  }

  if (totalVisible === 0) {
    body.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <div>Aradığınız kriterlere uygun bir ürün bulunamadı.</div>
      </div>`;
    return;
  }

  body.innerHTML = cats
    .map((c) => {
      const catItems = visibleByCat[c.id];
      if (catItems.length === 0) return "";
      return `
        <section class="category-section" id="cat-${c.id}" data-cat="${c.id}">
          <h2 class="category-title">${escapeHtml(c.name)}</h2>
          ${catItems.map((it) => renderItemCard(it, state)).join("")}
        </section>`;
    })
    .join("");

  body.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const delta = Number(btn.dataset.delta);
      changeQty(state, root, id, delta);
    });
  });
}

function renderItemCard(item, state) {
  const soldOut = !item.available;
  const qty = state.order.lines[item.id] || 0;
  const tagsHtml = item.allergens
    .filter((slug) => TAG_ICONS[slug])
    .map((slug) => {
      const label = TAGS.find((t) => t.slug === slug).label;
      return `<span class="tag-pill" title="${label}">${TAG_ICONS[slug]}<span>${label}</span></span>`;
    })
    .join("");

  return `
    <div class="item-card ${soldOut ? "sold-out" : ""}" data-item="${item.id}">
      ${soldOut ? '<span class="sold-out-badge">Tükendi</span>' : ""}
      <div class="item-thumb" style="${thumbStyle(item.id)}">${escapeHtml(initials(item.name))}</div>
      <div class="item-info">
        <div class="row-top">
          <span class="item-name">${escapeHtml(item.name)}</span>
          <span class="item-price">${fmtPrice(item.price)}</span>
        </div>
        <div class="item-desc">${escapeHtml(item.description)}</div>
        <div class="item-meta">
          <span class="prep-time">${item.prep_minutes} dk</span>
          ${tagsHtml}
        </div>
        <div class="qty-row">
          <button class="qty-btn" data-id="${item.id}" data-delta="-1" ${soldOut || qty === 0 ? "disabled" : ""}>−</button>
          <span class="qty-value">${qty}</span>
          <button class="qty-btn" data-id="${item.id}" data-delta="1" ${soldOut ? "disabled" : ""}>+</button>
        </div>
      </div>
    </div>`;
}

function changeQty(state, root, id, delta) {
  const item = state.data.items.find((it) => String(it.id) === String(id));
  if (!item || !item.available) return;
  const current = state.order.lines[id] || 0;
  const next = Math.max(0, current + delta);
  if (next === 0) {
    delete state.order.lines[id];
  } else {
    state.order.lines[id] = next;
  }
  saveOrder(state.order);
  renderMenuBody(state, root);
  updateOrderBar(state, root);
  renderOrderPanel(state, root);
}

function orderLineItems(state) {
  const result = [];
  for (const [id, qty] of Object.entries(state.order.lines)) {
    const item = state.data.items.find((it) => String(it.id) === String(id));
    if (item) result.push({ item, qty });
  }
  return result;
}

function orderTotal(state) {
  return orderLineItems(state).reduce((sum, l) => sum + l.item.price * l.qty, 0);
}

function updateOrderBar(state, root) {
  const lines = orderLineItems(state);
  const bar = root.querySelector("#order-bar");
  const count = lines.reduce((s, l) => s + l.qty, 0);
  root.querySelector("#order-count").textContent = `${count} ürün`;
  root.querySelector("#order-total").textContent = fmtPrice(orderTotal(state));
  bar.classList.toggle("visible", count > 0);
}

function renderOrderPanel(state, root) {
  const lines = orderLineItems(state);
  const linesEl = root.querySelector("#order-lines");
  if (lines.length === 0) {
    linesEl.innerHTML = `<div class="empty-state"><div>Henüz ürün eklemediniz.</div></div>`;
  } else {
    linesEl.innerHTML = lines
      .map(
        (l) => `
      <div class="order-line">
        <span class="name">${escapeHtml(l.item.name)}</span>
        <span class="qty">x${l.qty}</span>
        <span class="price">${fmtPrice(l.item.price * l.qty)}</span>
      </div>`
      )
      .join("");
  }
  root.querySelector("#order-summary-total").textContent = fmtPrice(orderTotal(state));
}

function buildOrderText(state) {
  const lines = orderLineItems(state);
  const parts = [];
  if (state.order.table != null) parts.push(`Masa ${state.order.table}`);
  parts.push("Sipariş Notu:");
  for (const l of lines) {
    parts.push(`${l.qty}x ${l.item.name} - ${fmtPrice(l.item.price * l.qty)}`);
  }
  parts.push(`Toplam: ${fmtPrice(orderTotal(state))}`);
  return parts.join("\n");
}

function setupScrollSpy(state, root) {
  const sections = root.querySelectorAll(".category-section");
  const rail = root.querySelector("#category-rail");
  if (sections.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const catId = entry.target.dataset.cat;
          rail.querySelectorAll(".category-pill").forEach((p) => {
            p.classList.toggle("active", p.dataset.cat === catId);
          });
          const activePill = rail.querySelector(`.category-pill[data-cat="${catId}"]`);
          if (activePill) activePill.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
      });
    },
    { rootMargin: "-96px 0px -70% 0px", threshold: 0 }
  );

  root._scrollObserver = observer;
  sections.forEach((s) => observer.observe(s));
}

function refreshScrollSpy(state, root) {
  if (root._scrollObserver) root._scrollObserver.disconnect();
  setupScrollSpy(state, root);
}

function wireCustomerEvents(state, root) {
  const searchInput = root.querySelector("#search-input");
  searchInput.addEventListener("input", () => {
    state.search = searchInput.value;
    renderMenuBody(state, root);
    refreshScrollSpy(state, root);
  });

  root.querySelector("#chip-row").addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    const tag = btn.dataset.tag;
    if (state.activeTags.has(tag)) {
      state.activeTags.delete(tag);
      btn.classList.remove("active");
    } else {
      state.activeTags.add(tag);
      btn.classList.add("active");
    }
    renderMenuBody(state, root);
    refreshScrollSpy(state, root);
  });

  root.querySelector("#category-rail").addEventListener("click", (e) => {
    const btn = e.target.closest(".category-pill");
    if (!btn) return;
    const section = root.querySelector(`#cat-${btn.dataset.cat}`);
    if (section) {
      const top = section.getBoundingClientRect().top + window.scrollY - 56;
      window.scrollTo({ top, behavior: "smooth" });
    }
  });

  const panel = root.querySelector("#order-panel");
  const openPanel = () => {
    renderOrderPanel(state, root);
    panel.classList.add("open");
  };
  const closePanel = () => panel.classList.remove("open");

  root.querySelector("#order-bar-open").addEventListener("click", openPanel);
  root.querySelector("#order-close").addEventListener("click", closePanel);
  root.querySelector("#order-backdrop").addEventListener("click", closePanel);

  root.querySelector("#order-clear").addEventListener("click", () => {
    state.order.lines = {};
    saveOrder(state.order);
    renderMenuBody(state, root);
    updateOrderBar(state, root);
    renderOrderPanel(state, root);
  });

  root.querySelector("#order-copy").addEventListener("click", async () => {
    const text = buildOrderText(state);
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      /* clipboard unavailable, fall through silently */
    }
    const btn = root.querySelector("#order-copy");
    const original = btn.textContent;
    btn.textContent = "Kopyalandı!";
    setTimeout(() => (btn.textContent = original), 1500);
  });
}

/* ================= Admin face ================= */

function initAdminPage() {
  const state = { authenticated: false, data: null, editingCategoryId: null, editingItemId: null };
  checkSession(state);
}

async function apiFetch(url, opts) {
  const res = await fetch(url, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts && opts.headers) },
  });
  if (res.status === 401) {
    showLoginForm(document.getElementById("app"));
    throw new Error("unauthorized");
  }
  return res;
}

async function checkSession(state) {
  const root = document.getElementById("app");
  if (!root) return;
  const res = await fetch("/api/session");
  const j = await res.json();
  if (j.authenticated) {
    state.authenticated = true;
    await loadAdminMenu(state, root);
  } else {
    showLoginForm(root);
  }
}

function showLoginForm(root) {
  root.innerHTML = `
    <div class="admin-login">
      <div class="admin-login-card">
        <h1>Yönetici Girişi</h1>
        <p class="sub">Menüyü düzenlemek için şifreyi girin.</p>
        <form id="login-form">
          <div class="field">
            <label for="password">Şifre</label>
            <input type="password" id="password" autocomplete="current-password" required>
            <div class="field-error" id="login-error"></div>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Giriş yap</button>
        </form>
      </div>
    </div>`;

  root.querySelector("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = root.querySelector("#password").value;
    const errorEl = root.querySelector("#login-error");
    errorEl.textContent = "";
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const state = { authenticated: true, data: null };
        await loadAdminMenu(state, root);
      } else {
        errorEl.textContent = "Şifre yanlış. Lütfen tekrar deneyin.";
      }
    } catch (e2) {
      errorEl.textContent = "Bağlantı hatası. Tekrar deneyin.";
    }
  });
}

async function loadAdminMenu(state, root) {
  const res = await apiFetch("/api/menu");
  state.data = await res.json();
  renderAdminShell(state, root);
}

function renderAdminShell(state, root) {
  const restaurant = state.data.restaurant;
  root.innerHTML = `
    <div class="admin-shell visible">
      <header class="admin-header">
        <div>
          <h1>${escapeHtml(restaurant.name)}</h1>
          <div class="sub">Yönetici Paneli</div>
        </div>
        <div class="admin-header-actions">
          <a href="/admin/qr" target="_blank">QR kartlarını yazdır</a>
          <button id="logout-btn">Çıkış</button>
        </div>
      </header>
      <div class="admin-body">
        <div class="admin-toolbar">
          <button class="btn btn-primary" id="new-category-btn" style="flex:none;padding:9px 16px;">+ Kategori Ekle</button>
        </div>
        <div id="categories-list"></div>
      </div>
    </div>
    <div id="modal-root"></div>`;

  renderCategoriesList(state, root);

  root.querySelector("#logout-btn").addEventListener("click", async () => {
    await fetch("/api/logout", { method: "POST" });
    showLoginForm(root);
  });

  root.querySelector("#new-category-btn").addEventListener("click", () => {
    openCategoryModal(state, root, null);
  });
}

function renderCategoriesList(state, root) {
  const list = root.querySelector("#categories-list");
  const cats = [...state.data.categories].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
  const items = [...state.data.items].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);

  list.innerHTML = cats
    .map((c, idx) => {
      const catItems = items.filter((it) => it.category_id === c.id);
      return `
      <div class="admin-category-block" data-cat="${c.id}">
        <div class="admin-category-head">
          <h2>${escapeHtml(c.name)}</h2>
          <div class="admin-actions">
            <button class="icon-btn" data-act="cat-up" data-id="${c.id}" ${idx === 0 ? "disabled" : ""}>↑</button>
            <button class="icon-btn" data-act="cat-down" data-id="${c.id}" ${idx === cats.length - 1 ? "disabled" : ""}>↓</button>
            <button class="icon-btn" data-act="cat-edit" data-id="${c.id}">✎</button>
            <button class="icon-btn danger" data-act="cat-del" data-id="${c.id}">✕</button>
            <button class="btn btn-secondary" data-act="item-new" data-id="${c.id}" style="flex:none;padding:6px 12px;font-size:12px;">+ Ürün</button>
          </div>
        </div>
        ${
          catItems.length === 0
            ? '<div class="empty-category">Bu kategoride henüz ürün yok.</div>'
            : catItems.map((it, i) => renderAdminItemRow(it, i, catItems.length)).join("")
        }
      </div>`;
    })
    .join("");

  list.querySelectorAll("[data-act]").forEach((btn) => {
    btn.addEventListener("click", () => handleAdminAction(state, root, btn.dataset.act, btn.dataset.id));
  });
}

function renderAdminItemRow(item, idx, total) {
  const tagsLabel = item.allergens
    .map((slug) => TAGS.find((t) => t.slug === slug))
    .filter(Boolean)
    .map((t) => t.label)
    .join(", ");
  return `
    <div class="admin-item-row" data-item="${item.id}">
      <div class="item-thumb" style="${thumbStyle(item.id)}">${escapeHtml(initials(item.name))}</div>
      <div class="admin-item-info">
        <div class="name">${escapeHtml(item.name)}</div>
        <div class="detail">${fmtPrice(item.price)} · ${item.prep_minutes} dk${tagsLabel ? " · " + escapeHtml(tagsLabel) : ""}</div>
      </div>
      <button class="avail-toggle ${item.available ? "on" : "off"}" data-act="item-avail" data-id="${item.id}">
        ${item.available ? "Satışta" : "Tükendi"}
      </button>
      <div class="admin-actions">
        <button class="icon-btn" data-act="item-up" data-id="${item.id}" ${idx === 0 ? "disabled" : ""}>↑</button>
        <button class="icon-btn" data-act="item-down" data-id="${item.id}" ${idx === total - 1 ? "disabled" : ""}>↓</button>
        <button class="icon-btn" data-act="item-edit" data-id="${item.id}">✎</button>
        <button class="icon-btn danger" data-act="item-del" data-id="${item.id}">✕</button>
      </div>
    </div>`;
}

async function handleAdminAction(state, root, act, id) {
  try {
    if (act === "cat-up" || act === "cat-down") {
      await apiFetch(`/api/admin/categories/${id}/move`, {
        method: "POST",
        body: JSON.stringify({ direction: act === "cat-up" ? "up" : "down" }),
      });
      await loadAdminMenu(state, root);
    } else if (act === "cat-edit") {
      const cat = state.data.categories.find((c) => String(c.id) === id);
      openCategoryModal(state, root, cat);
    } else if (act === "cat-del") {
      if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz? İçindeki tüm ürünler de silinecek.")) return;
      await apiFetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      await loadAdminMenu(state, root);
    } else if (act === "item-new") {
      openItemModal(state, root, null, Number(id));
    } else if (act === "item-up" || act === "item-down") {
      await apiFetch(`/api/admin/items/${id}/move`, {
        method: "POST",
        body: JSON.stringify({ direction: act === "item-up" ? "up" : "down" }),
      });
      await loadAdminMenu(state, root);
    } else if (act === "item-edit") {
      const item = state.data.items.find((it) => String(it.id) === id);
      openItemModal(state, root, item, item.category_id);
    } else if (act === "item-del") {
      if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
      await apiFetch(`/api/admin/items/${id}`, { method: "DELETE" });
      await loadAdminMenu(state, root);
    } else if (act === "item-avail") {
      const item = state.data.items.find((it) => String(it.id) === id);
      await apiFetch(`/api/admin/items/${id}/availability`, {
        method: "POST",
        body: JSON.stringify({ available: !item.available }),
      });
      await loadAdminMenu(state, root);
    }
  } catch (e) {
    if (e.message !== "unauthorized") console.error(e);
  }
}

function openModal(root, html) {
  const modalRoot = root.querySelector("#modal-root");
  modalRoot.innerHTML = `<div class="modal-overlay" id="modal-overlay"><div class="modal">${html}</div></div>`;
  modalRoot.querySelector("#modal-overlay").addEventListener("click", (e) => {
    if (e.target.id === "modal-overlay") closeModal(root);
  });
  return modalRoot;
}

function closeModal(root) {
  root.querySelector("#modal-root").innerHTML = "";
}

function openCategoryModal(state, root, cat) {
  const isEdit = !!cat;
  const html = `
    <h2>${isEdit ? "Kategoriyi Düzenle" : "Yeni Kategori"}</h2>
    <form id="category-form">
      <div class="field">
        <label for="cat-name">Ad</label>
        <input type="text" id="cat-name" value="${isEdit ? escapeHtml(cat.name) : ""}" required>
      </div>
      <div class="field-error" id="cat-error"></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" id="cat-cancel">Vazgeç</button>
        <button type="submit" class="btn btn-primary">Kaydet</button>
      </div>
    </form>`;
  openModal(root, html);
  root.querySelector("#cat-cancel").addEventListener("click", () => closeModal(root));
  root.querySelector("#category-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = root.querySelector("#cat-name").value.trim();
    if (!name) return;
    try {
      if (isEdit) {
        await apiFetch(`/api/admin/categories/${cat.id}`, {
          method: "PATCH",
          body: JSON.stringify({ name }),
        });
      } else {
        await apiFetch("/api/admin/categories", {
          method: "POST",
          body: JSON.stringify({ name }),
        });
      }
      closeModal(root);
      await loadAdminMenu(state, root);
    } catch (err) {
      root.querySelector("#cat-error").textContent = "Kaydedilemedi. Tekrar deneyin.";
    }
  });
}

function openItemModal(state, root, item, categoryId) {
  const isEdit = !!item;
  const cats = [...state.data.categories].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
  const catOptions = cats
    .map(
      (c) =>
        `<option value="${c.id}" ${c.id === categoryId ? "selected" : ""}>${escapeHtml(c.name)}</option>`
    )
    .join("");
  const currentTags = isEdit ? item.allergens : [];
  const tagChecks = TAGS.map(
    (t) => `
    <label class="tag-check">
      <input type="checkbox" name="tag" value="${t.slug}" ${currentTags.includes(t.slug) ? "checked" : ""}>
      ${t.label}
    </label>`
  ).join("");

  const html = `
    <h2>${isEdit ? "Ürünü Düzenle" : "Yeni Ürün"}</h2>
    <form id="item-form">
      <div class="field">
        <label for="item-name">Ad</label>
        <input type="text" id="item-name" value="${isEdit ? escapeHtml(item.name) : ""}" required>
      </div>
      <div class="field">
        <label for="item-category">Kategori</label>
        <select id="item-category">${catOptions}</select>
      </div>
      <div class="field">
        <label for="item-price">Fiyat (₺)</label>
        <input type="number" id="item-price" step="0.01" min="0" value="${isEdit ? item.price : ""}" required>
      </div>
      <div class="field">
        <label for="item-prep">Hazırlık Süresi (dk)</label>
        <input type="number" id="item-prep" step="1" min="0" value="${isEdit ? item.prep_minutes : 10}" required>
      </div>
      <div class="field">
        <label for="item-desc">Açıklama</label>
        <textarea id="item-desc">${isEdit ? escapeHtml(item.description) : ""}</textarea>
      </div>
      <div class="field">
        <label>Etiketler</label>
        <div class="tag-check-grid">${tagChecks}</div>
      </div>
      <div class="field-error" id="item-error"></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" id="item-cancel">Vazgeç</button>
        <button type="submit" class="btn btn-primary">Kaydet</button>
      </div>
    </form>`;
  openModal(root, html);
  root.querySelector("#item-cancel").addEventListener("click", () => closeModal(root));
  root.querySelector("#item-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      name: root.querySelector("#item-name").value.trim(),
      category_id: Number(root.querySelector("#item-category").value),
      price: Number(root.querySelector("#item-price").value),
      prep_minutes: Number(root.querySelector("#item-prep").value),
      description: root.querySelector("#item-desc").value.trim(),
      allergens: Array.from(root.querySelectorAll('input[name="tag"]:checked')).map((el) => el.value),
    };
    if (!payload.name) return;
    try {
      if (isEdit) {
        await apiFetch(`/api/admin/items/${item.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/api/admin/items", { method: "POST", body: JSON.stringify(payload) });
      }
      closeModal(root);
      await loadAdminMenu(state, root);
    } catch (err) {
      root.querySelector("#item-error").textContent = "Kaydedilemedi. Tekrar deneyin.";
    }
  });
}

/* ================= Bootstrap ================= */

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "customer") initCustomerPage();
  else if (page === "admin") initAdminPage();
});
