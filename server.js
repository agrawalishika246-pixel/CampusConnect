// ============================================================
// server.js — CampusConnect Express Server
// ============================================================
// This file starts a simple Express web server that serves all
// the static HTML, CSS, and JS files from the "public" folder.
//
// To run:  node app.js   (preferred)
//    or:   node server.js
// Then open:  http://localhost:3000
// ============================================================

const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// Serve everything inside /public as static files
app.use(express.static(path.join(__dirname, 'public')));

// Root route → redirect to index.html (already handled by static,
// but explicit for clarity)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all: any unknown route falls back to index.html
// (useful for single-page nav patterns)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log('========================================');
  console.log(` CampusConnect is running!`);
  console.log(` Open: http://localhost:${PORT}`);
  console.log('========================================');
});
