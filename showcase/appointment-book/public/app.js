(function () {
  'use strict';

  const DAY_NAMES = ['Pazartesi', 'Sali', 'Carsamba', 'Persembe', 'Cuma', 'Cumartesi'];
  const MONTH_NAMES = [
    'Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran',
    'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik',
  ];

  const gridHeadRow = document.getElementById('grid-head-row');
  const gridBody = document.getElementById('grid-body');
  const weekLabel = document.getElementById('week-label');
  const statToday = document.getElementById('stat-today');
  const statOccupancy = document.getElementById('stat-occupancy');
  const statNextFree = document.getElementById('stat-next-free');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalContent = document.getElementById('modal-content');
  const modalClose = document.getElementById('modal-close');

  let weekStart = null;
  let weekDays = [];
  let slotTimes = [];
  let todayIso = null;
  let appointmentsByKey = new Map();

  function cellKey(date, time) {
    return date + ' ' + time;
  }

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function formatShortDate(dateStr) {
    const [, m, d] = dateStr.split('-').map(Number);
    return d + ' ' + MONTH_NAMES[m - 1];
  }

  function formatFullDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return d + ' ' + MONTH_NAMES[m - 1] + ' ' + y;
  }

  function shiftWeek(dateStr, days) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() + days);
    return dt.getUTCFullYear() + '-' + pad2(dt.getUTCMonth() + 1) + '-' + pad2(dt.getUTCDate());
  }

  async function fetchWeek(ws) {
    const url = ws ? '/api/appointments?weekStart=' + ws : '/api/appointments';
    const res = await fetch(url);
    const data = await res.json();
    weekStart = data.weekStart;
    weekDays = data.days;
    slotTimes = data.slotTimes;
    todayIso = data.today;
    appointmentsByKey = new Map();
    for (const a of data.appointments) appointmentsByKey.set(cellKey(a.date, a.time), a);
    renderGrid();
  }

  async function fetchStats() {
    const res = await fetch('/api/stats');
    const data = await res.json();
    statToday.textContent = String(data.todayCount);
    statOccupancy.textContent = '%' + data.occupancyPercent;
    statNextFree.textContent = data.nextFreeSlot
      ? formatShortDate(data.nextFreeSlot.date) + ' ' + data.nextFreeSlot.time
      : 'Yok';
  }

  function renderGrid() {
    gridHeadRow.innerHTML = '<th class="time-col">Saat</th>';
    weekDays.forEach((dateStr, idx) => {
      const th = document.createElement('th');
      th.className = 'day-col' + (dateStr === todayIso ? ' today-col' : '');
      th.innerHTML =
        '<div class="day-name">' + DAY_NAMES[idx] + '</div>' +
        '<div class="day-date">' + formatShortDate(dateStr) + '</div>';
      gridHeadRow.appendChild(th);
    });

    gridBody.innerHTML = '';
    slotTimes.forEach((time) => {
      const tr = document.createElement('tr');
      const timeTd = document.createElement('td');
      timeTd.className = 'time-col';
      timeTd.textContent = time;
      tr.appendChild(timeTd);

      weekDays.forEach((dateStr) => {
        const td = document.createElement('td');
        td.className = 'day-col' + (dateStr === todayIso ? ' today-col' : '');
        const appt = appointmentsByKey.get(cellKey(dateStr, time));
        if (appt) {
          td.classList.add('cell-filled');
          td.innerHTML =
            '<div class="cell-name">' + escapeHtml(appt.customerName) + '</div>' +
            '<div class="cell-service">' + escapeHtml(appt.service) + '</div>';
          td.addEventListener('click', () => openDetails(appt));
        } else {
          td.classList.add('cell-empty');
          td.addEventListener('click', () => openBookingForm(dateStr, time));
        }
        tr.appendChild(td);
      });
      gridBody.appendChild(tr);
    });

    weekLabel.textContent = weekDays.length
      ? formatShortDate(weekDays[0]) + ' - ' + formatShortDate(weekDays[weekDays.length - 1])
      : '-';
  }

  function openModal() {
    modalBackdrop.hidden = false;
  }

  function closeModal() {
    modalBackdrop.hidden = true;
    modalContent.innerHTML = '';
  }

  function openBookingForm(dateStr, time) {
    modalContent.innerHTML = `
      <h2>Yeni Randevu</h2>
      <p class="modal-sub">${formatFullDate(dateStr)} - ${time}</p>
      <form id="booking-form">
        <label>Musteri Adi *<input type="text" name="customerName" required></label>
        <label>Telefon<input type="text" name="phone" placeholder="+90 5xx xxx xx xx"></label>
        <label>Hizmet<input type="text" name="service" placeholder="Sac Kesimi"></label>
        <label>Not<textarea name="note" rows="2"></textarea></label>
        <p class="form-error" id="form-error" hidden></p>
        <div class="modal-actions">
          <button type="submit" class="btn btn-primary">Kaydet</button>
        </div>
      </form>
    `;
    openModal();

    const form = document.getElementById('booking-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const errorEl = document.getElementById('form-error');
      errorEl.hidden = true;

      const payload = {
        date: dateStr,
        time,
        customerName: String(fd.get('customerName') || '').trim(),
        phone: String(fd.get('phone') || '').trim(),
        service: String(fd.get('service') || '').trim(),
        note: String(fd.get('note') || '').trim(),
      };

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        errorEl.textContent = data.error || 'Bir hata olustu.';
        errorEl.hidden = false;
        return;
      }

      closeModal();
      await fetchWeek(weekStart);
      await fetchStats();
    });
  }

  function openDetails(appt) {
    modalContent.innerHTML = `
      <h2>Randevu Detayi</h2>
      <p class="modal-sub">${formatFullDate(appt.date)} - ${appt.time}</p>
      <dl class="detail-list">
        <dt>Musteri</dt><dd>${escapeHtml(appt.customerName)}</dd>
        <dt>Telefon</dt><dd>${escapeHtml(appt.phone || '-')}</dd>
        <dt>Hizmet</dt><dd>${escapeHtml(appt.service || '-')}</dd>
        <dt>Not</dt><dd>${escapeHtml(appt.note || '-')}</dd>
      </dl>
      <div class="modal-actions">
        <button id="cancel-appt-btn" class="btn btn-danger">Iptal Et</button>
      </div>
    `;
    openModal();

    document.getElementById('cancel-appt-btn').addEventListener('click', async () => {
      const res = await fetch('/api/appointments/' + appt.id, { method: 'DELETE' });
      if (res.ok) {
        closeModal();
        await fetchWeek(weekStart);
        await fetchStats();
      }
    });
  }

  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  document.getElementById('prev-week-btn').addEventListener('click', () => fetchWeek(shiftWeek(weekStart, -7)));
  document.getElementById('next-week-btn').addEventListener('click', () => fetchWeek(shiftWeek(weekStart, 7)));
  document.getElementById('print-tomorrow-btn').addEventListener('click', () => {
    window.open('/print/tomorrow', '_blank');
  });

  fetchWeek(null);
  fetchStats();
  setInterval(fetchStats, 60000);
})();
