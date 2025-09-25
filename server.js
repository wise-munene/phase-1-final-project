const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Load JSON data
const matchesData = require('./db.json');

// Serve static frontend files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// API endpoint for matches
app.get('/api/matches', (req, res) => {
  res.json(matchesData.matches);
});

// Optional: API endpoint for league table
app.get('/api/league', (req, res) => {
  res.json(matchesData.league);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
