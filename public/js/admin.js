// ============================================================
// admin.js — CampusConnect Admin Dashboard Logic
// ============================================================
// Responsibilities:
//   1. Render top stat cards (total events, registrations, seats)
//   2. Render events table with per-event delete buttons
//   3. Handle Add Event form with validation
//   4. Render all registrations table with search filter
//   5. Delete individual registrations
//   6. Clear all events or registrations
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  renderAdminStats();
  renderEventsTable();
  renderRegistrationsTable();
  setupAddEventForm();
  setupRegSearch();
});

/* ── 1. Admin Stat Cards ─────────────────────────────────── */
function renderAdminStats() {
  const events = getEvents();
  const regs   = getRegistrations();
  const total  = events.reduce((s, e) => s + e.seats, 0);
  const taken  = regs.length;
  const avail  = events.reduce((s, e) => {
    return s + Math.max(0, e.seats - getRegistrationsByEvent(e.id).length);
  }, 0);

  const container = document.getElementById('adminStats');
  if (!container) return;

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-card-icon blue">📅</div>
      <div class="stat-card-info">
        <h3>${events.length}</h3>
        <p>Total Events</p>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon purple">👥</div>
      <div class="stat-card-info">
        <h3>${taken}</h3>
        <p>Registrations</p>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon green">🪑</div>
      <div class="stat-card-info">
        <h3>${avail}</h3>
        <p>Seats Available</p>
      </div>
    </div>`;
}

/* ── 2. Events Table ─────────────────────────────────────── */
function renderEventsTable() {
  const wrap = document.getElementById('eventsTableWrap');
  if (!wrap) return;

  const events = getEvents().sort((a, b) => a.date.localeCompare(b.date));

  if (events.length === 0) {
    wrap.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>No events yet. Use the form to add your first event!</p>
      </div>`;
    return;
  }

  const rows = events.map(evt => {
    const taken  = getRegistrationsByEvent(evt.id).length;
    const avail  = Math.max(0, evt.seats - taken);
    const cat    = categoryClass(evt.category);
    const isPast = isPastEvent(evt.date);
    return `
      <tr>
        <td><strong>${evt.name}</strong></td>
        <td><span class="badge badge-${cat}">${categoryLabel(evt.category)}</span></td>
        <td>${formatDate(evt.date)}<br/><span style="font-size:.78rem;color:#64748b;">${formatTime(evt.time)}</span></td>
        <td style="font-size:.85rem;">${evt.venue}</td>
        <td>
          <span style="font-weight:600;color:${avail <= 0 ? '#ef4444' : avail <= 10 ? '#f59e0b' : '#16a34a'}">
            ${avail} / ${evt.seats}
          </span>
          <br/><span style="font-size:.75rem;color:#94a3b8;">${taken} registered</span>
        </td>
        <td>
          ${isPast ? '<span class="badge" style="background:#f1f5f9;color:#94a3b8;">Past</span>'
                   : '<span class="badge" style="background:#dcfce7;color:#166534;">Active</span>'}
        </td>
        <td>
          <div style="display:flex;gap:.5rem;">
            <a href="event-details.html?id=${evt.id}" class="btn btn-outline-primary btn-sm">View</a>
            <button onclick="handleDeleteEvent('${evt.id}')" class="btn btn-danger btn-sm">Delete</button>
          </div>
        </td>
      </tr>`;
  }).join('');

  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Event Name</th>
          <th>Category</th>
          <th>Date & Time</th>
          <th>Venue</th>
          <th>Seats</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

/* ── 3. Add Event Form ───────────────────────────────────── */
function setupAddEventForm() {
  const form = document.getElementById('addEventForm');
  if (!form) return;

  // Set minimum date to today (can't add past events via UI)
  const dateInput = document.getElementById('evtDate');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Clear previous errors
    clearAdminErrors();

    // Collect values
    const name      = document.getElementById('evtName').value.trim();
    const category  = document.getElementById('evtCategory').value;
    const date      = document.getElementById('evtDate').value;
    const time      = document.getElementById('evtTime').value;
    const venue     = document.getElementById('evtVenue').value.trim();
    const seats     = parseInt(document.getElementById('evtSeats').value, 10);
    const organizer = document.getElementById('evtOrganizer').value.trim();
    const contact   = document.getElementById('evtContact').value.trim();
    const desc      = document.getElementById('evtDesc').value.trim();

    // ── Validate ──────────────────────────────────────────
    let hasError = false;

    if (!name) {
      showAdminError('evtErr-name', 'evtName');
      hasError = true;
    }
    if (!category) {
      showAdminError('evtErr-cat', 'evtCategory');
      hasError = true;
    }
    if (!date) {
      showAdminError('evtErr-date', 'evtDate');
      hasError = true;
    }
    if (!time) {
      showAdminError('evtErr-time', 'evtTime');
      hasError = true;
    }
    if (!venue) {
      showAdminError('evtErr-venue', 'evtVenue');
      hasError = true;
    }
    if (!seats || seats < 1 || seats > 9999 || isNaN(seats)) {
      showAdminError('evtErr-seats', 'evtSeats');
      hasError = true;
    }
    if (!desc) {
      showAdminError('evtErr-desc', 'evtDesc');
      hasError = true;
    }

    if (hasError) return;

    // ── Build event object and save ────────────────────────
    const newEvent = {
      id:         genId('evt'),
      name,
      category,
      date,
      time,
      venue,
      seats,
      description: desc,
      organizer:   organizer || 'TBD',
      contact:     contact   || ''
    };

    addEvent(newEvent);

    // Reset form
    form.reset();

    // Re-render tables and stats
    renderAdminStats();
    renderEventsTable();

    showToast(`"${name}" has been added successfully!`, 'success');

    // Scroll to events table so admin can see it
    document.getElementById('eventsTableWrap').scrollIntoView({ behavior: 'smooth' });
  });
}

/* ── 4. Delete a single event ────────────────────────────── */
function handleDeleteEvent(id) {
  const evt = getEventById(id);
  if (!evt) return;

  // Use a simple confirm dialog (native, no external library needed)
  const confirmed = confirm(
    `Delete "${evt.name}"?\n\nThis will also remove all ${getRegistrationsByEvent(id).length} registration(s) for this event. This cannot be undone.`
  );
  if (!confirmed) return;

  // Delete event
  deleteEvent(id);

  // Also delete all registrations for this event
  const regs = getRegistrations().filter(r => r.eventId !== id);
  saveRegistrations(regs);

  // Re-render everything
  renderAdminStats();
  renderEventsTable();
  renderRegistrationsTable();

  showToast(`"${evt.name}" has been deleted.`, 'error');
}

/* ── 5. Registrations Table ──────────────────────────────── */
function renderRegistrationsTable(filter = '') {
  const wrap = document.getElementById('registrationsTableWrap');
  if (!wrap) return;

  let regs = getRegistrations();

  // Apply search filter if provided
  if (filter) {
    const q = filter.toLowerCase();
    regs = regs.filter(r =>
      r.name.toLowerCase().includes(q)  ||
      r.email.toLowerCase().includes(q) ||
      r.branch.toLowerCase().includes(q)
    );
  }

  if (regs.length === 0) {
    wrap.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${filter ? '🔎' : '📋'}</div>
        <p>${filter ? 'No registrations match your search.' : 'No registrations yet.'}</p>
      </div>`;
    return;
  }

  // Sort newest first
  regs = [...regs].sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

  const rows = regs.map((r, i) => {
    // Look up the event name for this registration
    const evt = getEventById(r.eventId);
    const evtName = evt ? evt.name : `<em style="color:#94a3b8;">Deleted event</em>`;
    return `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${r.name}</strong></td>
        <td><a href="mailto:${r.email}" style="color:#4f46e5;">${r.email}</a></td>
        <td>${r.branch}</td>
        <td>${r.year}</td>
        <td>${r.phone || '—'}</td>
        <td style="font-size:.85rem;">${evtName}</td>
        <td><span style="font-size:.78rem;color:#64748b;">${new Date(r.registeredAt).toLocaleString()}</span></td>
        <td>
          <button onclick="handleDeleteReg('${r.id}')" class="btn btn-danger btn-sm">✕</button>
        </td>
      </tr>`;
  }).join('');

  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Email</th>
          <th>Branch</th>
          <th>Year</th>
          <th>Phone</th>
          <th>Event</th>
          <th>Registered On</th>
          <th>Remove</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

/* ── 6. Delete a single registration ─────────────────────── */
function handleDeleteReg(regId) {
  const confirmed = confirm('Remove this student registration? This cannot be undone.');
  if (!confirmed) return;

  deleteRegistration(regId);
  renderAdminStats();
  renderRegistrationsTable(document.getElementById('regSearch')?.value || '');
  showToast('Registration removed.', 'error');
}

/* ── 7. Search registrations ─────────────────────────────── */
function setupRegSearch() {
  const input = document.getElementById('regSearch');
  if (!input) return;

  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      renderRegistrationsTable(input.value.trim());
    }, 200);
  });
}

/* ── 8. Clear All (events or everything) ─────────────────── */
function confirmClearAll() {
  const confirmed = confirm(
    'WARNING: This will delete ALL events AND all student registrations.\n\nAre you absolutely sure? This cannot be undone.'
  );
  if (!confirmed) return;

  // Wipe both storage keys
  localStorage.removeItem('cc_events');
  localStorage.removeItem('cc_registrations');

  // Re-seed with sample data
  seedIfEmpty();

  // Re-render
  renderAdminStats();
  renderEventsTable();
  renderRegistrationsTable();

  showToast('All data cleared. Sample events have been reloaded.', 'info');
}

/* ── Form error helpers ──────────────────────────────────── */
function showAdminError(errId, fieldId) {
  const errEl   = document.getElementById(errId);
  const fieldEl = document.getElementById(fieldId);
  if (errEl)   errEl.classList.remove('d-none');
  if (fieldEl) fieldEl.classList.add('error');
}

function clearAdminErrors() {
  document.querySelectorAll('#addEventForm .form-error').forEach(el => el.classList.add('d-none'));
  document.querySelectorAll('#addEventForm .form-control.error').forEach(el => el.classList.remove('error'));
}
