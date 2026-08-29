const fmt = (n) => n.toLocaleString('tr-TR') + ' ₺';

async function draw() {
  const rows = await (await fetch('/api/week')).json();
  const max = Math.max(...rows.map((r) => r.total));
  const sum = rows.reduce((a, r) => a + r.total, 0);
  const best = rows.reduce((a, r) => (r.total > a.total ? r : a));

  document.getElementById('summary').innerHTML =
    `toplam <b>${fmt(sum)}</b> · en iyi gün <b>${best.day}</b> (${fmt(best.total)})`;

  document.getElementById('chart').innerHTML = rows.map((r) => `
    <div class="bar ${r === best ? 'best' : ''}">
      <b>${fmt(r.total)}</b>
      <i style="height:${(r.total / max) * 190}px"></i>
      <span>${r.day}</span>
    </div>`).join('');

  const sel = document.getElementById('day');
  if (!sel.options.length)
    sel.innerHTML = rows.map((r) => `<option>${r.day}</option>`).join('');
}

document.getElementById('edit').addEventListener('submit', async (e) => {
  e.preventDefault();
  await fetch('/api/day', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      day: document.getElementById('day').value,
      total: document.getElementById('total').value,
    }),
  });
  e.target.reset();
  draw();
});

draw();
