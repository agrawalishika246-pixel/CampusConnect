// ============================================================
// register.js — CampusConnect Registration Page Logic
// ============================================================
// Responsibilities:
//   1. Populate event dropdown (pre-select if ?id= in URL)
//   2. Show event summary banner when arriving from details page
//   3. Validate all form fields with clear error messages
//   4. Prevent duplicate registrations (same email + event)
//   5. Save registration to localStorage
//   6. Show success screen with student details
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  populateEventDropdown();
  checkUrlForEventId();

  // Attach form submit handler
  const form = document.getElementById('registrationForm');
  if (form) form.addEventListener('submit', handleFormSubmit);
});

/* ── Populate the event dropdown ─────────────────────────── */
function populateEventDropdown() {
  const select = document.getElementById('eventSelect');
  if (!select) return;

  // Only show upcoming events with available seats
  const events = getEvents()
    .filter(e => !isPastEvent(e.date))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (events.length === 0) {
    select.innerHTML = '<option value="">No upcoming events available</option>';
    select.disabled = true;
    return;
  }

  // Build option HTML: "TechFest 2025 — Aug 15, 2025 (280 seats left)"
  events.forEach(evt => {
    const taken = getRegistrationsByEvent(evt.id).length;
    const avail = Math.max(0, evt.seats - taken);
    const opt   = document.createElement('option');
    opt.value   = evt.id;
    opt.textContent = `${evt.name} — ${formatDate(evt.date)} (${avail} seats left)`;
    opt.disabled    = avail <= 0;    // disable full events
    select.appendChild(opt);
  });
}

/* ── Pre-select event if ?id= URL param exists ───────────── */
function checkUrlForEventId() {
  const params  = new URLSearchParams(window.location.search);
  const eventId = params.get('id');
  if (!eventId) return;

  // Pre-select in dropdown
  const select = document.getElementById('eventSelect');
  if (select) select.value = eventId;

  // Show event summary banner
  const evt = getEventById(eventId);
  if (!evt) return;

  const summary = document.getElementById('eventSummary');
  if (!summary) return;

  const taken = getRegistrationsByEvent(evt.id).length;
  const avail = Math.max(0, evt.seats - taken);

  summary.classList.remove('d-none');
  summary.innerHTML = `
    <div class="flex-gap flex-wrap">
      <span style="font-size:1.5rem;">📌</span>
      <div>
        <p style="margin:0; font-weight:700; color:#1e293b;">${evt.name}</p>
        <p style="margin:0; font-size:.85rem; color:#64748b;">
          ${formatDate(evt.date)} · ${formatTime(evt.time)} · ${evt.venue}
          · <strong style="color:${avail <= 10 ? '#ef4444' : '#16a34a'}">${avail} seats left</strong>
        </p>
      </div>
    </div>`;
}

/* ── Form Submit Handler ─────────────────────────────────── */
// This function is called when the form is submitted.
// It validates inputs, checks for duplicates, saves the registration,
// and shows the success screen.
function handleFormSubmit(e) {
  e.preventDefault();   // Stop the default browser form submission

  // Clear any previous errors
  clearAllErrors();

  // Collect values from the form
  const eventId = document.getElementById('eventSelect').value.trim();
  const name    = document.getElementById('studentName').value.trim();
  const email   = document.getElementById('studentEmail').value.trim();
  const branch  = document.getElementById('studentBranch').value.trim();
  const year    = document.getElementById('studentYear').value.trim();
  const phone   = document.getElementById('studentPhone').value.trim();

  // ── Validate ──────────────────────────────────────────────
  let hasError = false;

  if (!eventId) {
    showFieldError('err-event', 'eventSelect');
    hasError = true;
  }

  if (!name || name.length < 3) {
    showFieldError('err-name', 'studentName');
    hasError = true;
  }

  // Basic email regex check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    showFieldError('err-email', 'studentEmail');
    hasError = true;
  }

  if (!branch) {
    showFieldError('err-branch', 'studentBranch');
    hasError = true;
  }

  if (!year) {
    showFieldError('err-year', 'studentYear');
    hasError = true;
  }

  // Phone is optional — validate only if provided
  if (phone && !/^\d{10}$/.test(phone)) {
    showFieldError('err-phone', 'studentPhone');
    hasError = true;
  }

  // Stop here if any validation failed
  if (hasError) return;

  // ── Duplicate check ───────────────────────────────────────
  if (isAlreadyRegistered(email, eventId)) {
    showToast(`${email} is already registered for this event.`, 'error');
    showFieldError('err-email', 'studentEmail');
    document.getElementById('err-email').textContent =
      'You are already registered for this event with this email.';
    return;
  }

  // ── Check seats ───────────────────────────────────────────
  const evt   = getEventById(eventId);
  const taken = getRegistrationsByEvent(eventId).length;
  const avail = Math.max(0, evt.seats - taken);

  if (avail <= 0) {
    showToast('Sorry, this event is now full!', 'error');
    return;
  }

  // ── Save registration ─────────────────────────────────────
  const registration = {
    id:           genId('reg'),     // unique registration ID
    eventId:      eventId,
    name:         name,
    email:        email,
    branch:       branch,
    year:         year,
    phone:        phone || null,    // null if not provided
    registeredAt: new Date().toISOString()
  };

  addRegistration(registration);

  // ── Show success screen ───────────────────────────────────
  document.getElementById('formSection').classList.add('d-none');
  const successSection = document.getElementById('successSection');
  successSection.classList.remove('d-none');

  // Personalised message
  document.getElementById('successMsg').innerHTML = `
    Hi <strong>${name}</strong>! You have successfully registered for 
    <strong>${evt.name}</strong> on ${formatDate(evt.date)}.
    We look forward to seeing you at <em>${evt.venue}</em>.
  `;

  // Scroll to success card
  successSection.scrollIntoView({ behavior: 'smooth' });

  showToast(`Registration successful! See you at ${evt.name} 🎉`, 'success');
}

/* ── Field Error Helpers ─────────────────────────────────── */
// Show the error message span and add red border to the input
function showFieldError(errId, fieldId) {
  const errEl   = document.getElementById(errId);
  const fieldEl = document.getElementById(fieldId);
  if (errEl)   errEl.classList.remove('d-none');
  if (fieldEl) fieldEl.classList.add('error');
}

// Hide all error messages and remove red borders
function clearAllErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.classList.add('d-none'));
  document.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));
}

/* ── Reset form to register for another event ────────────── */
// Called by the "Register for Another" button in the success screen
function resetForm() {
  clearAllErrors();
  document.getElementById('registrationForm').reset();
  document.getElementById('successSection').classList.add('d-none');
  const formSection = document.getElementById('formSection');
  formSection.classList.remove('d-none');

  // Re-populate the dropdown (seat counts may have changed)
  const select = document.getElementById('eventSelect');
  select.innerHTML = '<option value="">— Choose an event —</option>';
  populateEventDropdown();

  formSection.scrollIntoView({ behavior: 'smooth' });
}
