/* const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Load JSON data
const matchesData = require('./db.json');

// API endpoint
app.get('/api/matches', (req, res) => {
  res.json(matchesData.matches);
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
 */