'use strict';

// Cuzdan front end. Renders state returned by the /api/ endpoints, no page reloads.

const CATEGORY_LABELS = {
  food: 'Yeme-İçme',
  transport: 'Ulaşım',
  bills: 'Faturalar',
  entertainment: 'Eğlence',
  groceries: 'Market',
  other: 'Diğer',
};

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const entryForm = document.getElementById('entry-form');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const noteInput = document.getElementById('note');
const formError = document.getElementById('form-error');

const limitForm = document.getElementById('limit-form');
const limitInput = document.getElementById('limit-input');
const limitBand = document.getElementById('limit-band');
const limitStatusText = document.getElementById('limit-status-text');

const monthTotalEl = document.getElementById('month-total');
const monthAverageEl = document.getElementById('month-average');
const monthProjectionEl = document.getElementById('month-projection');
const categoryListEl = document.getElementById('category-list');
const expenseListEl = document.getElementById('expense-list');

function money(value) {
  return currencyFormatter.format(value);
}

function showFormError(message) {
  if (message) {
    formError.textContent = message;
    formError.hidden = false;
  } else {
    formError.hidden = true;
    formError.textContent = '';
  }
}

function renderSummary(state) {
  monthTotalEl.textContent = money(state.month.total);
  monthAverageEl.textContent = money(state.month.average);
  monthProjectionEl.textContent = money(state.month.projection);
}

function renderLimitBand(state) {
  limitBand.classList.remove('status-neutral', 'status-warning', 'status-exceeded');
  limitBand.classList.add(`status-${state.limitStatus}`);

  if (!state.limit) {
    limitStatusText.textContent = 'Aylık limit belirlenmedi';
    return;
  }

  const percent = Math.round(state.limitPercent);
  if (state.limitStatus === 'exceeded') {
    limitStatusText.textContent = `Limit aşıldı: ${money(state.month.total)} / ${money(state.limit)}`;
  } else {
    limitStatusText.textContent = `Limitin %${percent}'i harcandı: ${money(state.month.total)} / ${money(state.limit)}`;
  }
}

function renderCategories(state) {
  categoryListEl.innerHTML = '';
  const topCategory = state.categories.find((c) => c.amount > 0);

  for (const item of state.categories) {
    if (item.amount <= 0) continue;
    const row = document.createElement('div');
    row.className = 'category-row';
    if (topCategory && item.category === topCategory.category) {
      row.classList.add('is-top');
    }

    row.innerHTML = `
      <div class="category-row-head">
        <span class="category-name">${CATEGORY_LABELS[item.category]}</span>
        <span>${Math.round(item.percent)}% · ${money(item.amount)}</span>
      </div>
      <div class="category-bar-track">
        <div class="category-bar-fill" style="width: ${Math.max(2, item.percent)}%"></div>
      </div>
    `;
    categoryListEl.appendChild(row);
  }

  if (!categoryListEl.children.length) {
    categoryListEl.innerHTML = '<p class="empty-state">Henüz harcama yok</p>';
  }
}

function renderExpenses(state) {
  expenseListEl.innerHTML = '';

  if (!state.expenses.length) {
    expenseListEl.innerHTML = '<li class="empty-state">Henüz harcama yok</li>';
    return;
  }

  for (const expense of state.expenses) {
    const li = document.createElement('li');
    li.className = 'expense-row';
    const when = dateFormatter.format(new Date(expense.created_at));
    const noteText = expense.note ? ` · ${expense.note}` : '';

    li.innerHTML = `
      <div class="expense-info">
        <span class="expense-category">${CATEGORY_LABELS[expense.category] || expense.category}</span>
        <span class="expense-meta">${when}${noteText}</span>
      </div>
      <span class="expense-amount">${money(expense.amount)}</span>
      <button type="button" class="expense-delete" data-id="${expense.id}" aria-label="Sil">×</button>
    `;
    expenseListEl.appendChild(li);
  }
}

function renderState(state) {
  renderSummary(state);
  renderLimitBand(state);
  renderCategories(state);
  renderExpenses(state);
}

async function loadState() {
  const response = await fetch('/api/state');
  const state = await response.json();
  renderState(state);
}

entryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showFormError('');

  const payload = {
    amount: Number(amountInput.value),
    category: categoryInput.value,
    note: noteInput.value,
  };

  const response = await fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  if (!response.ok) {
    showFormError(data.error || 'Bir hata oluştu.');
    return;
  }

  entryForm.reset();
  renderState(data);
  amountInput.focus();
});

limitForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const response = await fetch('/api/limit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit: Number(limitInput.value) }),
  });
  const data = await response.json();
  if (response.ok) {
    limitForm.reset();
    renderState(data);
  }
});

expenseListEl.addEventListener('click', async (event) => {
  const button = event.target.closest('.expense-delete');
  if (!button) return;

  const response = await fetch(`/api/expenses/${button.dataset.id}`, { method: 'DELETE' });
  const data = await response.json();
  if (response.ok) {
    renderState(data);
  }
});

loadState();
