'use strict';

// Data layer: sqlite storage plus the calendar-math helpers the server needs.
// Dates are stored and passed around as plain ISO strings (YYYY-MM-DD) so week
// navigation stays correct across month boundaries; day-of-week math is done
// through a UTC-anchored Date to avoid local DST shifting a calendar day.

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const DB_PATH = path.join(__dirname, '..', 'appointments.sqlite');

const SLOT_TIMES = [];
for (let h = 9; h < 19; h++) {
  SLOT_TIMES.push(`${String(h).padStart(2, '0')}:00`);
  SLOT_TIMES.push(`${String(h).padStart(2, '0')}:30`);
}

const WORK_DAYS = 6; // Monday .. Saturday
const SLOTS_PER_WEEK = SLOT_TIMES.length * WORK_DAYS;
const PHONE_PATTERN = /^\+?[0-9 ]+$/;

function openDb() {
  const db = new DatabaseSync(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      phone TEXT,
      service TEXT,
      note TEXT,
      created_at TEXT NOT NULL,
      UNIQUE(date, time)
    )
  `);
  return db;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

function nowTimeHHMM() {
  const now = new Date();
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
}

function parseIsoDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatIsoDate(d) {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function addDays(dateStr, days) {
  const d = parseIsoDate(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return formatIsoDate(d);
}

function dayOfWeek(dateStr) {
  return parseIsoDate(dateStr).getUTCDay(); // 0 Sun .. 6 Sat
}

function weekStartOf(dateStr) {
  const dow = dayOfWeek(dateStr);
  const offset = (dow + 6) % 7; // Monday -> 0
  return addDays(dateStr, -offset);
}

function weekDates(weekStart) {
  const dates = [];
  for (let i = 0; i < WORK_DAYS; i++) dates.push(addDays(weekStart, i));
  return dates;
}

function isValidDateStr(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function seedIfEmpty(db) {
  const row = db.prepare('SELECT COUNT(*) AS c FROM appointments').get();
  if (row.c > 0) return;

  const weekStart = weekStartOf(todayIso());
  const seeds = [
    { dayOffset: 0, time: '09:30', customer_name: 'Elif Yilmaz', phone: '+90 532 111 2233', service: 'Sac Kesimi', note: 'Ilk randevusu' },
    { dayOffset: 1, time: '11:00', customer_name: 'Mehmet Kaya', phone: '0532 444 5566', service: 'Sakal Tras', note: '' },
    { dayOffset: 2, time: '14:30', customer_name: 'Ayse Demir', phone: '+90 533 222 9988', service: 'Sac Boyama', note: 'Alerji kontrolu yapilacak' },
    { dayOffset: 4, time: '16:00', customer_name: 'Can Ozturk', phone: '0555 777 8899', service: 'Fon', note: '' },
  ];

  const insert = db.prepare(`
    INSERT INTO appointments (date, time, customer_name, phone, service, note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const now = new Date().toISOString();
  for (const s of seeds) {
    const date = addDays(weekStart, s.dayOffset);
    insert.run(date, s.time, s.customer_name, s.phone, s.service, s.note, now);
  }
}

function rowToAppointment(row) {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    customerName: row.customer_name,
    phone: row.phone || '',
    service: row.service || '',
    note: row.note || '',
  };
}

function getAppointmentsForWeek(db, weekStart) {
  const dates = weekDates(weekStart);
  const placeholders = dates.map(() => '?').join(', ');
  const rows = db
    .prepare(`SELECT * FROM appointments WHERE date IN (${placeholders}) ORDER BY date, time`)
    .all(...dates);
  return rows.map(rowToAppointment);
}

function getAppointmentsForDate(db, date) {
  const rows = db.prepare('SELECT * FROM appointments WHERE date = ? ORDER BY time').all(date);
  return rows.map(rowToAppointment);
}

function getAppointmentByDateTime(db, date, time) {
  const row = db.prepare('SELECT * FROM appointments WHERE date = ? AND time = ?').get(date, time);
  return row ? rowToAppointment(row) : null;
}

function insertAppointment(db, data) {
  const insert = db.prepare(`
    INSERT INTO appointments (date, time, customer_name, phone, service, note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = insert.run(
    data.date,
    data.time,
    data.customerName,
    data.phone || '',
    data.service || '',
    data.note || '',
    new Date().toISOString()
  );
  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(result.lastInsertRowid);
  return rowToAppointment(row);
}

function deleteAppointment(db, id) {
  const result = db.prepare('DELETE FROM appointments WHERE id = ?').run(id);
  return result.changes > 0;
}

function countForDate(db, date) {
  return db.prepare('SELECT COUNT(*) AS c FROM appointments WHERE date = ?').get(date).c;
}

function countForWeek(db, weekStart) {
  const dates = weekDates(weekStart);
  const placeholders = dates.map(() => '?').join(', ');
  return db.prepare(`SELECT COUNT(*) AS c FROM appointments WHERE date IN (${placeholders})`).get(...dates).c;
}

function slotIndexAtOrAfter(hh, mm) {
  const minutesOfDay = hh * 60 + mm;
  for (let i = 0; i < SLOT_TIMES.length; i++) {
    const [sh, sm] = SLOT_TIMES[i].split(':').map(Number);
    if (sh * 60 + sm >= minutesOfDay) return i;
  }
  return -1;
}

function findNextFreeSlot(db, fromDate, fromTime, maxDays = 90) {
  let date = fromDate;
  let [h, m] = fromTime.split(':').map(Number);
  let startIndex = slotIndexAtOrAfter(h, m);

  for (let d = 0; d < maxDays; d++) {
    if (dayOfWeek(date) === 0 || startIndex === -1) {
      date = addDays(date, 1);
      startIndex = 0;
      continue;
    }

    const booked = new Set(db.prepare('SELECT time FROM appointments WHERE date = ?').all(date).map((r) => r.time));
    for (let i = startIndex; i < SLOT_TIMES.length; i++) {
      if (!booked.has(SLOT_TIMES[i])) return { date, time: SLOT_TIMES[i] };
    }
    date = addDays(date, 1);
    startIndex = 0;
  }
  return null;
}

module.exports = {
  openDb,
  seedIfEmpty,
  SLOT_TIMES,
  WORK_DAYS,
  SLOTS_PER_WEEK,
  PHONE_PATTERN,
  todayIso,
  nowTimeHHMM,
  addDays,
  dayOfWeek,
  weekStartOf,
  weekDates,
  isValidDateStr,
  getAppointmentsForWeek,
  getAppointmentsForDate,
  getAppointmentByDateTime,
  insertAppointment,
  deleteAppointment,
  countForDate,
  countForWeek,
  findNextFreeSlot,
};
