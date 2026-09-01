// Every aggregation used by the API lives here. Each function takes the
// open SQLite connection and returns a plain JS value; none of them
// mutate the database or any shared state.
'use strict';

function formatDateTr(isoDate) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
}

function formatCurrencyTr(value) {
  return `${Math.round(value).toLocaleString('tr-TR')} TL`;
}

function computeSummary(db) {
  const totals = db.prepare('SELECT SUM(revenue) AS totalRevenue, SUM(qty) AS totalUnits FROM sales').get();
  const bestProduct = db
    .prepare('SELECT product, SUM(revenue) AS revenue FROM sales GROUP BY product ORDER BY revenue DESC LIMIT 1')
    .get();
  const strongestCity = db
    .prepare('SELECT city, SUM(revenue) AS revenue FROM sales GROUP BY city ORDER BY revenue DESC LIMIT 1')
    .get();

  return {
    totalRevenue: totals.totalRevenue || 0,
    totalUnits: totals.totalUnits || 0,
    bestProduct: bestProduct ? { name: bestProduct.product, revenue: bestProduct.revenue } : null,
    strongestCity: strongestCity ? { name: strongestCity.city, revenue: strongestCity.revenue } : null,
  };
}

function computeDaily(db) {
  const rows = db.prepare('SELECT date, SUM(revenue) AS revenue FROM sales GROUP BY date ORDER BY date ASC').all();
  return rows.map((row) => ({ date: row.date, revenue: row.revenue }));
}

function computeCategories(db) {
  const rows = db
    .prepare('SELECT category, SUM(revenue) AS revenue FROM sales GROUP BY category ORDER BY revenue DESC')
    .all();
  const total = rows.reduce((sum, row) => sum + row.revenue, 0);
  return rows.map((row) => ({
    category: row.category,
    revenue: row.revenue,
    percentage: total > 0 ? (row.revenue / total) * 100 : 0,
  }));
}

function computeCities(db) {
  const rows = db
    .prepare(
      'SELECT city, SUM(revenue) AS revenue, SUM(qty) AS units, COUNT(*) AS orders FROM sales GROUP BY city ORDER BY revenue DESC',
    )
    .all();
  return rows.map((row) => ({
    city: row.city,
    revenue: row.revenue,
    units: row.units,
    orders: row.orders,
    avgBasket: row.orders > 0 ? row.revenue / row.orders : 0,
  }));
}

function computeInsight(db) {
  const bestDay = db
    .prepare('SELECT date, SUM(revenue) AS revenue FROM sales GROUP BY date ORDER BY revenue DESC LIMIT 1')
    .get();
  const categories = computeCategories(db);
  const cities = computeCities(db);
  const standoutCategory = categories[0];
  const weakestCity = cities.length > 0 ? cities[cities.length - 1] : null;

  const observations = [];
  if (bestDay) {
    observations.push(`En güçlü gün ${formatDateTr(bestDay.date)} oldu, ${formatCurrencyTr(bestDay.revenue)} ciro ile.`);
  }
  if (standoutCategory) {
    observations.push(
      `${standoutCategory.category} kategorisi toplam cironun yüzde ${standoutCategory.percentage.toFixed(1)}'ini oluşturarak öne çıkıyor.`,
    );
  }
  if (weakestCity) {
    observations.push(
      `${weakestCity.city} en düşük ciroyu üretiyor; burada hedefli bir kampanya düzenlemek satışları dengeleyebilir.`,
    );
  }

  return { observations };
}

module.exports = { computeSummary, computeDaily, computeCategories, computeCities, computeInsight };
