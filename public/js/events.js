// ============================================================
// events.js — CampusConnect Events Listing Page
// ============================================================
// Responsibilities:
//   1. Read search / category filter from URL or UI
//   2. Filter + sort the events array
//   3. Render event cards into the grid
//   4. Wire up live search, category chips, sort dropdown
// ============================================================

// --- State ---
let currentCategory = 'all';  // which category chip is active
let currentSearch   = '';      // live search text
let currentSort     = 'date-asc';

document.addEventListener('DOMContentLoaded', () => {
  // Check if a category was passed in the URL: events.html?category=tech
  const params = new URLSearchParams(window.location.search);
  if (params.get('category')) {
    currentCategory = params.get('category');
  }

  // Wire up UI controls
  setupSearch();
  setupCategoryChips();
  setupSort();

  // Initial render
  renderEvents();
});

/* ── Search Input ────────────────────────────────────────── */
function setupSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;

  // Re-render on every keystroke (debounced slightly)
  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentSearch = input.value.trim().toLowerCase();
      renderEvents();
    }, 200);  // wait 200ms after user stops typing
  });
}

/* ── Category Chips ──────────────────────────────────────── */
function setupCategoryChips() {
  const chips = document.querySelectorAll('#categoryChips .chip');

  // If URL had a category, activate the matching chip immediately
  chips.forEach(chip => {
    if (chip.dataset.cat === currentCategory) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      // Update active chip visually
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      currentCategory = chip.dataset.cat;
      renderEvents();
    });
  });
}

/* ── Sort Dropdown ───────────────────────────────────────── */
function setupSort() {
  const sel = document.getElementById('sortSelect');
  if (!sel) return;
  sel.value = currentSort;

  sel.addEventListener('change', () => {
    currentSort = sel.value;
    renderEvents();
  });
}

/* ── Main Render Function ────────────────────────────────── */
function renderEvents() {
  const container = document.getElementById('eventsGrid');
  const countEl   = document.getElementById('resultsCount');
  if (!container) return;

  // 1. Get all events from localStorage
  let events = getEvents();

  // 2. Filter by category
  if (currentCategory !== 'all') {
    events = events.filter(e => e.category === currentCategory);
  }

  // 3. Filter by search text (searches name, venue, description)
  if (currentSearch) {
    events = events.filter(e =>
      e.name.toLowerCase().includes(currentSearch)        ||
      e.venue.toLowerCase().includes(currentSearch)       ||
      e.description.toLowerCase().includes(currentSearch) ||
      e.organizer?.toLowerCase().includes(currentSearch)
    );
  }

  // 4. Sort
  events = sortEvents(events, currentSort);

  // 5. Update results label
  if (countEl) {
    countEl.textContent = `Showing ${events.length} event${events.length !== 1 ? 's' : ''}`;
  }

  // 6. Render
  if (events.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🔎</div>
        <h3>No events found</h3>
        <p>Try adjusting your search or category filter.</p>
      </div>`;
    return;
  }

  container.innerHTML = events.map(buildEventCard).join('');
}

/* ── Sort Helper ─────────────────────────────────────────── */
function sortEvents(events, mode) {
  // Create a shallow copy so we don't mutate the original array
  const arr = [...events];

  if (mode === 'date-asc')   return arr.sort((a,b) => a.date.localeCompare(b.date));
  if (mode === 'date-desc')  return arr.sort((a,b) => b.date.localeCompare(a.date));
  if (mode === 'name-asc')   return arr.sort((a,b) => a.name.localeCompare(b.name));
  if (mode === 'seats-desc') return arr.sort((a,b) => b.seats - a.seats);

  return arr; // default: no change
}
