// ============================================================
// home.js — CampusConnect Home Page Logic
// ============================================================
// Responsibilities:
//   1. Render stats (total events, registrations, categories, seats)
//   2. Render the first 6 upcoming events as cards
//   3. Render the category quick-browse grid
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  renderStats();
  renderFeaturedEvents();
  renderCategories();
});

/* ── 1. Stats Bar ────────────────────────────────────────── */
function renderStats() {
  const events = getEvents();
  const regs   = getRegistrations();

  // Count unique categories that have at least one event
  const cats = new Set(events.map(e => e.category)).size;

  // Total available seats across all events (minus registrations)
  const totalSeats = events.reduce((sum, e) => {
    const taken = getRegistrationsByEvent(e.id).length;
    return sum + Math.max(0, e.seats - taken);
  }, 0);

  const statsGrid = document.getElementById('statsGrid');
  if (!statsGrid) return;

  statsGrid.innerHTML = `
    <div class="stat-item">
      <h3>${events.length}</h3>
      <p>Total Events</p>
    </div>
    <div class="stat-item">
      <h3>${regs.length}</h3>
      <p>Registrations</p>
    </div>
    <div class="stat-item">
      <h3>${cats}</h3>
      <p>Categories</p>
    </div>
    <div class="stat-item">
      <h3>${totalSeats}</h3>
      <p>Seats Available</p>
    </div>
  `;
}

/* ── 2. Featured Events (first 6 upcoming) ───────────────── */
function renderFeaturedEvents() {
  const container = document.getElementById('featuredEvents');
  if (!container) return;

  // Sort by date ascending, show only upcoming events (max 6)
  const events = getEvents()
    .filter(e => !isPastEvent(e.date))        // exclude past events
    .sort((a, b) => a.date.localeCompare(b.date)) // soonest first
    .slice(0, 6);                              // take max 6

  if (events.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">📭</div>
        <h3>No upcoming events</h3>
        <p>Check back soon or <a href="admin.html" class="text-primary">add events via Admin</a>.</p>
      </div>`;
    return;
  }

  // Build all card HTML and inject at once (efficient)
  container.innerHTML = events.map(buildEventCard).join('');
}

/* ── 3. Category Quick-Browse Grid ──────────────────────── */
function renderCategories() {
  const container = document.getElementById('categoriesGrid');
  if (!container) return;

  // Define all categories with their display info
  const categories = [
    { id: 'tech',     label: 'Tech',      icon: '💻', color: '#4f46e5', bg: '#ede9fe', desc: 'Hackathons, coding contests & workshops'  },
    { id: 'culture',  label: 'Culture',   icon: '🎭', color: '#d97706', bg: '#fef3c7', desc: 'Music, dance, drama & art exhibitions'    },
    { id: 'sports',   label: 'Sports',    icon: '⚽', color: '#16a34a', bg: '#dcfce7', desc: 'Cricket, football, athletics & more'      },
    { id: 'workshop', label: 'Workshop',  icon: '🔧', color: '#0e7490', bg: '#cffafe', desc: 'Hands-on learning & skill development'    },
    { id: 'seminar',  label: 'Seminar',   icon: '🎓', color: '#9333ea', bg: '#fae8ff', desc: 'Career guidance, guest lectures & panels' },
    { id: 'other',    label: 'Other',     icon: '📌', color: '#475569', bg: '#f1f5f9', desc: 'Club events, fests & miscellaneous'       }
  ];

  const events = getEvents();

  container.innerHTML = categories.map(cat => {
    // Count how many events belong to this category
    const count = events.filter(e => e.category === cat.id).length;
    return `
      <a href="events.html?category=${cat.id}" class="card" 
         style="padding:1.75rem; text-align:center; cursor:pointer; transition: transform .2s, box-shadow .2s; text-decoration:none;"
         onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,.12)'"
         onmouseout="this.style.transform='';this.style.boxShadow=''">
        <div style="width:60px;height:60px;border-radius:50%;background:${cat.bg};
                    display:flex;align-items:center;justify-content:center;
                    font-size:1.6rem;margin:0 auto .75rem;">
          ${cat.icon}
        </div>
        <h3 style="color:${cat.color}; margin-bottom:.35rem;">${cat.label}</h3>
        <p style="font-size:.85rem; margin-bottom:.5rem;">${cat.desc}</p>
        <span style="font-size:.8rem; font-weight:600; color:${cat.color};">
          ${count} event${count !== 1 ? 's' : ''}
        </span>
      </a>`;
  }).join('');
}
