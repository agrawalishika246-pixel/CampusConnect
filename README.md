# 🎓 CampusConnect — College Event Management System

A beginner-friendly full-stack web application for managing college events.  
Built with **HTML · CSS · JavaScript · Node.js · Express.js** · Data stored in **localStorage** (no database needed).

---

## 📁 Project Structure

```
CampusConnect/
├── server.js              ← Express server
├── package.json           ← Node.js project config
└── public/                ← All web pages (served as static files)
    ├── index.html         ← Home page
    ├── events.html        ← Events listing with search & filter
    ├── event-details.html ← Single event details + registered students
    ├── register.html      ← Student registration form
    ├── admin.html         ← Admin dashboard
    ├── css/
    │   └── styles.css     ← All styles (responsive, mobile-first)
    └── js/
        ├── app.js         ← Shared utilities, localStorage helpers, sample data
        ├── home.js        ← Home page logic
        ├── events.js      ← Events listing + search/filter/sort
        ├── event-details.js ← Event detail view
        ├── register.js    ← Registration form + validation
        └── admin.js       ← Admin dashboard logic
```

---

## 🚀 How to Run in VS Code

### Prerequisites
Make sure you have **Node.js** installed.  
Download from: https://nodejs.org (choose the LTS version)

To check: open a terminal and run:
```bash
node --version    # should show v18.x or higher
npm --version     # should show 9.x or higher
```

---

### Step-by-Step Setup

**1. Open the project in VS Code**
```
File → Open Folder → select the "CampusConnect" folder
```

**2. Open the integrated terminal**
```
Terminal → New Terminal   (or press Ctrl + `)
```

**3. Install dependencies**
```bash
npm install
```
This downloads the `express` package into a `node_modules/` folder.

**4. Start the server**
```bash
node server.js
```
You should see:
```
========================================
 CampusConnect is running!
 Open: http://localhost:3000
========================================
```

**5. Open in browser**  
Go to: **http://localhost:3000**

---

### Optional: Auto-restart on file changes (for development)

Install nodemon globally (one-time setup):
```bash
npm install -g nodemon
```
Then run:
```bash
npm run dev
```
The server will automatically restart whenever you save a file.

---

## 📄 Pages Overview

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` or `/index.html` | Hero banner, stats, featured events, categories |
| Events | `/events.html` | Full event listing with search, category filter, sort |
| Event Details | `/event-details.html?id=evt-001` | Full event info + registered students table |
| Registration | `/register.html` or `/register.html?id=evt-001` | Student registration form with validation |
| Admin | `/admin.html` | Add/delete events, view all registrations |

---

## ✨ Features

- **10 sample events** pre-loaded on first run (Tech, Culture, Sports, Workshop, Seminar)
- **Search** events by name, venue, description, or organizer
- **Filter** events by category (chip buttons)
- **Sort** events by date, name, or seats
- **Register** for any event — validates name, email, branch, year, phone
- **Duplicate prevention** — same email cannot register for the same event twice
- **Seats tracking** — registration count is live; full events are disabled
- **Admin dashboard** — add new events, delete events, remove registrations
- **Fully responsive** — works on mobile, tablet, and desktop
- **localStorage** — all data persists in the browser without any database

---

## 🗃️ localStorage Keys

| Key | Contents |
|-----|----------|
| `cc_events` | JSON array of all event objects |
| `cc_registrations` | JSON array of all registration objects |

To reset all data: go to Admin → "Clear All" button, or open browser DevTools → Application → Local Storage → delete the keys.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| HTML5 | Page structure and markup |
| CSS3 | Styling, responsive layout (CSS Grid, Flexbox) |
| Vanilla JavaScript (ES6+) | Frontend logic, localStorage, DOM manipulation |
| Node.js | Server runtime |
| Express.js | Static file server |

---

## 📝 Code Comments

Every file is heavily commented for beginners:
- Each function has a comment explaining **what it does**
- Complex logic has **inline comments** explaining the steps
- Files begin with a **table of contents** or **responsibilities list**

---

## 🤝 Extending the Project

Some ideas for next steps:
- Replace localStorage with a **MongoDB** database using `mongoose`
- Add **user authentication** (login for students/admin) using `passport.js`
- Send **confirmation emails** using `nodemailer`
- Add an **export to CSV** button for the registrations table
- Deploy to **Render.com** or **Railway.app** for free hosting

---

*Built as a beginner-friendly college project — CampusConnect 2025*
