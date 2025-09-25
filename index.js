const API_URL = "https://raw.githubusercontent.com/openfootball/football.json/master/2022-23/en.1.json";

let matchesData = [];  // flat array
let filteredData = [];

// Fetch and flatten
async function fetchMatches() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    // Flatten rounds → matches
    const flat = [];

    data.rounds.forEach(round => {
      const matchdayName = round.name;  // e.g. "Matchday 1"
      round.matches.forEach(match => {
        flat.push({
          matchday: matchdayName,
          date: match.date,
          team1: match.team1,
          team2: match.team2,
          score1: match.score1,
          score2: match.score2
        });
      });
    });

    matchesData = flat;
    filteredData = flat;
    renderMatches(filteredData);
  } catch (err) {
    console.error("Error fetching matches:", err);
  }
}

// Render matches (cards) adapted to this structure
function renderMatches(matches) {
  const container = document.getElementById("matchesContainer");
  container.innerHTML = "";
  if (matches.length === 0) {
    container.innerHTML = "<p>No matches found.</p>";
    return;
  }
  matches.forEach(m => {
    const card = document.createElement("div");
    card.className = "match-card";
    card.innerHTML = `
      <div class="match-header">${m.matchday}</div>
      <div class="match-detail"><strong>${m.team1}</strong> vs <strong>${m.team2}</strong></div>
      <div class="match-detail">Date: ${m.date}</div>
      <div class="match-detail">Score: ${m.score1} – ${m.score2}</div>
    `;
    container.appendChild(card);
  });
}

// Example event: filter by team select
const teamSelect = document.getElementById("teamSelect");
teamSelect.addEventListener("change", e => {
  const team = e.target.value;
  const filtered = matchesData.filter(m => m.team1 === team || m.team2 === team);
  renderMatches(filtered);
});

// ... (other listeners: search, matchday, etc.)

// Initialize
fetchMatches();
