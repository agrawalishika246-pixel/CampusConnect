// ============================================================
// app.js — CampusConnect Shared Utilities
// ============================================================
// This file is included on EVERY page. It provides:
//   • SAMPLE_EVENTS  – default events loaded on first run
//   • Storage helpers – read/write events & registrations
//   • UI helpers     – toast notifications, active nav link,
//                      badge/banner class by category
// ============================================================

/* ── Sample Events ──────────────────────────────────────────
   These events are injected into localStorage the very first
   time someone opens the app (or after clearing storage).
   Each event has a unique `id` string.
   ────────────────────────────────────────────────────────── */
/* ── Helper: returns a future date string "YYYY-MM-DD" ──────
   offset = number of days from today.
   Used so sample events are always in the future regardless
   of when the app is first opened.
   ────────────────────────────────────────────────────────── */
function futureDateStr(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

const SAMPLE_EVENTS = [
  {
    id: 'evt-001',
    name: 'TechFest 2026',
    category: 'tech',
    date: futureDateStr(10),
    time: '09:00',
    venue: 'Main Auditorium, Block A',
    description: 'Annual technology festival featuring hackathon, coding contests, robotics demos, AI workshops, and guest lectures from industry leaders. Open to all branches.',
    seats: 300,
    organizer: 'Computer Science Department',
    contact: 'techfest@campusconnect.edu'
  },
  {
    id: 'evt-002',
    name: 'Cultural Night 2026',
    category: 'culture',
    date: futureDateStr(17),
    time: '18:00',
    venue: 'Open-Air Theatre',
    description: 'Celebrate diversity through dance, music, drama, and art. Participate in solo and group performances. Prize money for top 3 acts in each category.',
    seats: 500,
    organizer: 'Student Cultural Committee',
    contact: 'culture@campusconnect.edu'
  },
  {
    id: 'evt-003',
    name: 'Inter-College Cricket Tournament',
    category: 'sports',
    date: futureDateStr(5),
    time: '08:00',
    venue: 'Main Sports Ground',
    description: 'Two-day knockout cricket tournament with 12 college teams competing. Live commentary, refreshments, and trophies for winners and runners-up.',
    seats: 150,
    organizer: 'Sports Board',
    contact: 'sports@campusconnect.edu'
  },
  {
    id: 'evt-004',
    name: 'Web Development Bootcamp',
    category: 'workshop',
    date: futureDateStr(30),
    time: '10:00',
    venue: 'Lab 203, IT Block',
    description: 'Hands-on 2-day bootcamp covering HTML, CSS, JavaScript, and React. Participants will build a full project from scratch. Laptops required.',
    seats: 60,
    organizer: 'Web Dev Club',
    contact: 'webdev@campusconnect.edu'
  },
  {
    id: 'evt-005',
    name: 'Career Guidance Seminar',
    category: 'seminar',
    date: futureDateStr(37),
    time: '11:00',
    venue: 'Seminar Hall 1',
    description: 'Panel discussion with HR leaders from top MNCs. Topics: resume building, cracking interviews, internship strategies, and higher studies abroad.',
    seats: 200,
    organizer: 'Training & Placement Cell',
    contact: 'tnp@campusconnect.edu'
  },
  {
    id: 'evt-006',
    name: 'AI & Machine Learning Workshop',
    category: 'workshop',
    date: futureDateStr(45),
    time: '09:30',
    venue: 'Conference Room B',
    description: 'Beginner-friendly ML workshop using Python, scikit-learn, and TensorFlow. Covers data preprocessing, model training, and real-world use cases.',
    seats: 80,
    organizer: 'AI Research Club',
    contact: 'aiclub@campusconnect.edu'
  },
  {
    id: 'evt-007',
    name: 'Annual Sports Meet',
    category: 'sports',
    date: futureDateStr(56),
    time: '07:00',
    venue: 'Stadium & Ground',
    description: 'Two-day sports extravaganza featuring athletics (100m, 400m, relay), basketball, volleyball, and chess. Medals and certificates for all winners.',
    seats: 400,
    organizer: 'Sports Department',
    contact: 'sportsmeet@campusconnect.edu'
  },
  {
    id: 'evt-008',
    name: 'Photography Exhibition',
    category: 'culture',
    date: futureDateStr(65),
    time: '10:00',
    venue: 'Art Gallery, Admin Block',
    description: 'Submit your best photographs under the theme "Campus Life". Selected entries will be displayed for 3 days. Best entries win cash prizes.',
    seats: 100,
    organizer: 'Photography Club',
    contact: 'photo@campusconnect.edu'
  },
  {
    id: 'evt-009',
    name: 'Entrepreneurship Summit',
    category: 'seminar',
    date: futureDateStr(73),
    time: '10:00',
    venue: 'Main Auditorium',
    description: 'Meet successful startup founders, pitch your ideas to angel investors, and attend workshops on building your MVP. Limited seats — register early!',
    seats: 250,
    organizer: 'E-Cell',
    contact: 'ecell@campusconnect.edu'
  },
  {
    id: 'evt-010',
    name: 'Green Campus Hackathon',
    category: 'tech',
    date: futureDateStr(80),
    time: '08:00',
    venue: 'Innovation Lab, Ground Floor',
    description: '24-hour hackathon focused on sustainability and green technology solutions. Teams of 3-4 members. Prizes worth Rs.50,000 for top solutions.',
    seats: 120,
    organizer: 'IEEE Student Branch',
    contact: 'ieee@campusconnect.edu'
  }
];

/* ── Storage Keys ───────────────────────────────────────────
   We keep all data under two localStorage keys.
   ────────────────────────────────────────────────────────── */
const KEYS = {
  EVENTS:        'cc_events',
  REGISTRATIONS: 'cc_registrations',
  SEEDED:        'cc_seeded'   // flag: have we loaded sample data yet?
};

/* ── Initialize: seed sample data on first load ─────────────
   Only runs once per browser session.  Admins can delete
   events but sample data is re-seeded if all events are gone.
   ────────────────────────────────────────────────────────── */
function seedIfEmpty() {
  const existing = getEvents();
  if (!existing || existing.length === 0) {
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(SAMPLE_EVENTS));
  }
}

// Run immediately when this script loads
seedIfEmpty();

/* ── Events CRUD ────────────────────────────────────────────
   getEvents()         → returns array of all event objects
   saveEvents(arr)     → writes array to localStorage
   getEventById(id)    → returns single event or null
   addEvent(evt)       → appends a new event, saves
   deleteEvent(id)     → removes by id, saves
   ────────────────────────────────────────────────────────── */
function getEvents() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.EVENTS)) || [];
  } catch (e) {
    return [];
  }
}

function saveEvents(eventsArr) {
  localStorage.setItem(KEYS.EVENTS, JSON.stringify(eventsArr));
}

function getEventById(id) {
  return getEvents().find(e => e.id === id) || null;
}

function addEvent(evt) {
  const events = getEvents();
  events.push(evt);
  saveEvents(events);
}

function deleteEvent(id) {
  const filtered = getEvents().filter(e => e.id !== id);
  saveEvents(filtered);
}

function updateEventSeats(id, seatsUsed) {
  const events = getEvents();
  const idx = events.findIndex(e => e.id === id);
  if (idx !== -1) {
    events[idx].seats = Math.max(0, events[idx].seats - seatsUsed);
    saveEvents(events);
  }
}

/* ── Registrations CRUD ─────────────────────────────────────
   getRegistrations()           → all registrations
   saveRegistrations(arr)       → write to localStorage
   getRegistrationsByEvent(id)  → registrations for one event
   addRegistration(reg)         → append & save
   deleteRegistration(regId)    → remove by regId & save
   isAlreadyRegistered(email,eventId) → boolean
   ────────────────────────────────────────────────────────── */
function getRegistrations() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.REGISTRATIONS)) || [];
  } catch (e) {
    return [];
  }
}

function saveRegistrations(arr) {
  localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify(arr));
}

function getRegistrationsByEvent(eventId) {
  return getRegistrations().filter(r => r.eventId === eventId);
}

function addRegistration(reg) {
  const regs = getRegistrations();
  regs.push(reg);
  saveRegistrations(regs);
}

function deleteRegistration(regId) {
  const filtered = getRegistrations().filter(r => r.id !== regId);
  saveRegistrations(filtered);
}

function isAlreadyRegistered(email, eventId) {
  return getRegistrations().some(
    r => r.email.toLowerCase() === email.toLowerCase() && r.eventId === eventId
  );
}

/* ── Category helpers ───────────────────────────────────────
   Returns the CSS class suffix to use for badge & banner.
   ────────────────────────────────────────────────────────── */
function categoryClass(cat) {
  const map = {
    tech: 'tech', culture: 'culture', sports: 'sports',
    workshop: 'workshop', seminar: 'seminar', other: 'other'
  };
  return map[cat] || 'other';
}

function categoryLabel(cat) {
  const labels = {
    tech: '💻 Tech', culture: '🎭 Culture', sports: '⚽ Sports',
    workshop: '🔧 Workshop', seminar: '🎓 Seminar', other: '📌 Other'
  };
  return labels[cat] || cat;
}

/* ── Date / Time formatting ─────────────────────────────────
   formatDate('2025-08-15')  → 'Aug 15, 2025'
   formatTime('09:00')       → '9:00 AM'
   ────────────────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, min] = timeStr.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour   = h % 12 || 12;
  return `${hour}:${String(min).padStart(2,'0')} ${suffix}`;
}

function isPastEvent(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [y,m,d] = dateStr.split('-').map(Number);
  return new Date(y, m-1, d) < today;
}

/* ── Unique ID generator ────────────────────────────────────
   Generates a simple unique ID like 'evt-a3f7b2'
   ────────────────────────────────────────────────────────── */
function genId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ── Toast notification ─────────────────────────────────────
   showToast('Event added!', 'success')
   showToast('Something went wrong', 'error')
   ────────────────────────────────────────────────────────── */
function showToast(message, type = 'success') {
  // Remove any existing toast first
  const old = document.querySelector('.toast');
  if (old) old.remove();

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  document.body.appendChild(toast);

  // Auto-remove after 3.5 seconds
  setTimeout(() => {
    toast.style.transition = 'opacity .4s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/* ── Active nav link ────────────────────────────────────────
   Call on each page to highlight the current nav link.
   ────────────────────────────────────────────────────────── */
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path) a.classList.add('active');
    else a.classList.remove('active');
  });
}

/* ── Mobile nav toggle ──────────────────────────────────────
   Wire up the hamburger menu (shared across all pages).
   ────────────────────────────────────────────────────────── */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
  });

  // Close menu when any link is clicked
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
}

/* ── Seats badge helper ─────────────────────────────────────
   Returns an HTML string for the seats remaining badge.
   ────────────────────────────────────────────────────────── */
function seatsBadge(seats) {
  if (seats <= 0)  return `<span class="seats-info full">Seats Full</span>`;
  if (seats <= 10) return `<span class="seats-info low">⚠️ ${seats} left</span>`;
  return              `<span class="seats-info ok">✅ ${seats} seats left</span>`;
}

/* ── Build an event card HTML string ────────────────────────
   Used on both Home and Events pages.
   ────────────────────────────────────────────────────────── */
function buildEventCard(evt) {
  const cat   = categoryClass(evt.category);
  const label = categoryLabel(evt.category);
  const regs  = getRegistrationsByEvent(evt.id).length;
  const avail = Math.max(0, evt.seats - regs);

  return `
    <article class="event-card" data-id="${evt.id}">
      <div class="event-card-banner ${cat}"></div>
      <div class="event-card-body">
        <div class="flex-between">
          <span class="badge badge-${cat}">${label}</span>
          ${isPastEvent(evt.date) ? '<span class="badge" style="background:#f1f5f9;color:#94a3b8">Past</span>' : ''}
        </div>
        <h3 class="event-card-title">${evt.name}</h3>
        <div class="event-card-meta">
          <span><span class="icon">📅</span>${formatDate(evt.date)}</span>
          <span><span class="icon">🕐</span>${formatTime(evt.time)}</span>
          <span><span class="icon">📍</span>${evt.venue}</span>
        </div>
        <p class="event-card-desc">${evt.description}</p>
      </div>
      <div class="event-card-footer">
        ${seatsBadge(avail)}
        <a href="event-details.html?id=${evt.id}" class="btn btn-outline-primary btn-sm">View Details →</a>
      </div>
    </article>`;
}

/* ── Run on every page load ─────────────────────────────────
   DOMContentLoaded fires once the HTML is parsed.
   ────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initMobileNav();
});
