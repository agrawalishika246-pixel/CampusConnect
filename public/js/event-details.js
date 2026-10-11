// ============================================================
// event-details.js — CampusConnect Event Details Page
// ============================================================
// Responsibilities:
//   1. Read event `id` from URL query string (?id=evt-001)
//   2. Load that event from localStorage
//   3. Render full event details + a sidebar registration widget
//   4. Show list of already-registered students
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Read the event id from the URL: event-details.html?id=evt-001
  const params  = new URLSearchParams(window.location.search);
  const eventId = params.get('id');

  if (!eventId) {
    // No id supplied → show error
    showError('No event ID was provided. Please go back to the Events page.');
    return;
  }

  const evt = getEventById(eventId);

  if (!evt) {
    // id not found in storage
    showError(`Event with ID "${eventId}" was not found. It may have been deleted.`);
    return;
  }

  // Update page title and breadcrumb
  document.title = `${evt.name} – CampusConnect`;
  const bc = document.getElementById('breadcrumbTitle');
  if (bc) bc.textContent = evt.name;

  // Render the event
  renderDetail(evt);
});

/* ── Render the full detail view ─────────────────────────── */
function renderDetail(evt) {
  const container = document.getElementById('detailContainer');
  if (!container) return;

  // How many people registered for this event already?
  const registrations = getRegistrationsByEvent(evt.id);
  const taken  = registrations.length;
  const avail  = Math.max(0, evt.seats - taken);
  const cat    = categoryClass(evt.category);
  const isFull = avail <= 0;
  const isPast = isPastEvent(evt.date);

  container.innerHTML = `
    <div class="event-detail-grid">

      <!-- ── Left: Event Info Card ── -->
      <div class="event-detail-card">
        <div class="event-detail-banner ${cat}" style="height:14px;"></div>
        <div class="event-detail-content">

          <div class="flex-gap mb-2">
            <span class="badge badge-${cat}">${categoryLabel(evt.category)}</span>
            ${isPast ? '<span class="badge" style="background:#f1f5f9;color:#94a3b8;">Concluded</span>' : '<span class="badge" style="background:#dcfce7;color:#166534;">Upcoming</span>'}
          </div>

          <h1 style="font-size:1.75rem; color:#1e293b; margin-bottom:1rem;">${evt.name}</h1>

          <!-- Key details grid -->
          <div class="event-detail-meta">
            <div class="meta-item">
              <label>📅 Date</label>
              <span>${formatDate(evt.date)}</span>
            </div>
            <div class="meta-item">
              <label>🕐 Time</label>
              <span>${formatTime(evt.time)}</span>
            </div>
            <div class="meta-item">
              <label>📍 Venue</label>
              <span>${evt.venue}</span>
            </div>
            <div class="meta-item">
              <label>🪑 Seats</label>
              <span>${avail} of ${evt.seats} available</span>
            </div>
            ${evt.organizer ? `
            <div class="meta-item">
              <label>🏛️ Organizer</label>
              <span>${evt.organizer}</span>
            </div>` : ''}
            ${evt.contact ? `
            <div class="meta-item">
              <label>📧 Contact</label>
              <span>${evt.contact}</span>
            </div>` : ''}
          </div>

          <!-- Description -->
          <h3 style="margin-bottom:.75rem;">About This Event</h3>
          <p style="color:#475569; line-height:1.7; font-size:.95rem;">${evt.description}</p>

          <!-- Seat progress bar -->
          <div style="margin-top:1.5rem;">
            <div class="flex-between mb-1">
              <span style="font-size:.82rem; font-weight:600; color:#64748b;">Registration Progress</span>
              <span style="font-size:.82rem; font-weight:700; color:#4f46e5;">${taken} / ${evt.seats} registered</span>
            </div>
            <div style="background:#e2e8f0; border-radius:99px; height:8px; overflow:hidden;">
              <div style="background:linear-gradient(90deg,#4f46e5,#06b6d4);
                          height:100%; width:${Math.min(100, (taken/evt.seats)*100)}%;
                          border-radius:99px; transition:width .5s ease;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Right: Registration Sidebar ── -->
      <div class="register-sidebar">
        <h3 style="margin-bottom:1rem;">🎟️ Register for This Event</h3>

        ${isFull ? `
          <div class="alert alert-error">
            <span>⚠️</span>
            <span>Registrations are full for this event. No seats remaining.</span>
          </div>
        ` : isPast ? `
          <div class="alert alert-warning">
            <span>📅</span>
            <span>This event has already taken place. Registrations are closed.</span>
          </div>
        ` : `
          <div class="alert alert-info" style="margin-bottom:1rem;">
            <span>ℹ️</span>
            <span><strong>${avail} seat${avail !== 1 ? 's' : ''}</strong> remaining. Register before they fill up!</span>
          </div>
          <a href="register.html?id=${evt.id}" class="btn btn-primary w-100 btn-lg"
             style="display:flex; justify-content:center;">
            Register Now →
          </a>
        `}

        <div style="margin-top:1.5rem; padding-top:1.25rem; border-top:1px solid #e2e8f0;">
          <h4 style="margin-bottom:.75rem; font-size:.9rem; text-transform:uppercase;
                     letter-spacing:.05em; color:#64748b;">Quick Info</h4>
          <div style="display:flex; flex-direction:column; gap:.5rem; font-size:.88rem;">
            <div class="flex-between">
              <span style="color:#64748b;">Date</span>
              <span style="font-weight:600;">${formatDate(evt.date)}</span>
            </div>
            <div class="flex-between">
              <span style="color:#64748b;">Time</span>
              <span style="font-weight:600;">${formatTime(evt.time)}</span>
            </div>
            <div class="flex-between">
              <span style="color:#64748b;">Category</span>
              <span style="font-weight:600;">${categoryLabel(evt.category)}</span>
            </div>
            <div class="flex-between">
              <span style="color:#64748b;">Registered</span>
              <span style="font-weight:600;">${taken} students</span>
            </div>
          </div>
        </div>

        <div style="margin-top:1.25rem; padding-top:1.25rem; border-top:1px solid #e2e8f0;">
          <a href="events.html" style="font-size:.85rem; color:#4f46e5; font-weight:600;">
            ← Back to All Events
          </a>
        </div>
      </div>

    </div>

    <!-- ── Registered Students Table (below the grid) ── -->
    <div class="card mt-4">
      <div class="card-header">
        <h3>👥 Registered Students <span style="color:#64748b; font-weight:400;">(${taken})</span></h3>
      </div>
      <div class="card-body">
        ${renderRegistrationsTable(registrations)}
      </div>
    </div>
  `;
}

/* ── Registered students table ───────────────────────────── */
function renderRegistrationsTable(registrations) {
  if (registrations.length === 0) {
    return `<div class="empty-state">
              <div class="empty-icon">👤</div>
              <p>No students have registered yet. Be the first!</p>
            </div>`;
  }

  const rows = registrations.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${r.name}</strong></td>
      <td>${r.email}</td>
      <td>${r.branch}</td>
      <td>${r.year}</td>
      <td><span style="font-size:.78rem; color:#64748b;">${new Date(r.registeredAt).toLocaleDateString()}</span></td>
    </tr>`).join('');

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Branch</th>
            <th>Year</th>
            <th>Registered On</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

/* ── Error state ─────────────────────────────────────────── */
function showError(message) {
  const container = document.getElementById('detailContainer');
  if (!container) return;
  container.innerHTML = `
    <div class="empty-state" style="padding:5rem 2rem;">
      <div class="empty-icon">⚠️</div>
      <h3>Event Not Found</h3>
      <p>${message}</p>
      <a href="events.html" class="btn btn-primary mt-3">← Browse Events</a>
    </div>`;
}
