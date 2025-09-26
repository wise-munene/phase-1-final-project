document.addEventListener('DOMContentLoaded', () => {
  const teamSelect = document.getElementById('teamSelect');
  const matchdaySelect = document.getElementById('matchdaySelect');
  const viewSelect = document.getElementById('viewSelect');
  const matchesSection = document.getElementById('matchesSection');
  const matchesTableBody = document.querySelector('#matchesTable tbody');
  const leagueSection = document.getElementById('leagueSection');
  const leagueMatchdaySelect = document.getElementById('leagueMatchdaySelect');
  const leagueTableBody = document.querySelector('#leagueTable tbody');

  // Hide both sections initially
  matchesSection.style.display = 'none';
  leagueSection.style.display = 'none';

  const MATCHES_URL = 'http://localhost:3000/matches';

  // --- Helper Functions ---

  // Generate league table from matches
  function generateLeagueTable(matches) {
    const table = {};

    matches.forEach(match => {
      const { team1, team2, score } = match;
      const [goals1, goals2] = score.split('-').map(Number);

      if (!table[team1]) table[team1] = { team: team1, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
      if (!table[team2]) table[team2] = { team: team2, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };

      table[team1].played++;
      table[team2].played++;

      table[team1].gf += goals1;
      table[team1].ga += goals2;
      table[team2].gf += goals2;
      table[team2].ga += goals1;

      table[team1].gd = table[team1].gf - table[team1].ga;
      table[team2].gd = table[team2].gf - table[team2].ga;

      if (goals1 > goals2) {
        table[team1].won++; table[team2].lost++; table[team1].points += 3;
      } else if (goals1 < goals2) {
        table[team2].won++; table[team1].lost++; table[team2].points += 3;
      } else {
        table[team1].draw++; table[team2].draw++; table[team1].points++; table[team2].points++;
      }
    });

    const leagueArray = Object.values(table);
    leagueArray.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

    leagueArray.forEach((team, i) => team.position = i + 1);
    return leagueArray;
  }

  // Render league table in DOM
  function renderLeagueTable(league, upToDay = null) {
    leagueTableBody.innerHTML = '';
    let tableData = league;

    if (upToDay) {
      // Recompute points only up to selected matchday
      tableData = generateLeagueTable(matches.filter(m => m.matchday <= upToDay));
    }

    tableData.forEach(team => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${team.position}</td>
        <td>${team.team}</td>
        <td>${team.played}</td>
        <td>${team.won}</td>
        <td>${team.draw}</td>
        <td>${team.lost}</td>
        <td>${team.gf}</td>
        <td>${team.ga}</td>
        <td>${team.gd}</td>
        <td>${team.points}</td>
      `;
      leagueTableBody.appendChild(tr);
    });
  }

  // Render matches in DOM
  function displayMatches(list) {
    matchesTableBody.innerHTML = '';
    if (!list.length) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="4">No matches found</td>';
      matchesTableBody.appendChild(tr);
      return;
    }
    list.forEach(m => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${m.date}</td>
        <td>${m.team1}</td>
        <td>${m.team2}</td>
        <td>${m.score}</td>
      `;
      matchesTableBody.appendChild(tr);
    });
  }

  // Filter matches by selected team and matchday
  function filterMatches() {
    let filtered = matches.slice();
    const selDay = matchdaySelect.value;
    const selTeam = teamSelect.value;

    if (selDay) filtered = filtered.filter(m => String(m.matchday) === String(selDay));
    if (selTeam) filtered = filtered.filter(m => m.team1 === selTeam || m.team2 === selTeam);

    displayMatches(filtered);
  }

  // --- Fetch Data ---
  let matches = [];
  let league = [];

  fetch(MATCHES_URL)
    .then(res => res.json())
    .then(data => {
      matches = data;

      // Prepare dropdowns
      const matchdays = Array.from(new Set(matches.map(m => m.matchday))).sort((a,b) => a-b);
      const teams = Array.from(new Set(matches.flatMap(m => [m.team1, m.team2]))).sort();

      function clearAndAddPlaceholder(selectEl, text) {
        selectEl.innerHTML = '';
        const ph = document.createElement('option');
        ph.value = '';
        ph.textContent = text;
        selectEl.appendChild(ph);
      }

      clearAndAddPlaceholder(teamSelect, 'All Teams');
      teams.forEach(t => {
        const o = document.createElement('option');
        o.value = t;
        o.textContent = t;
        teamSelect.appendChild(o);
      });

      clearAndAddPlaceholder(matchdaySelect, 'All Matchdays');
      matchdays.forEach(md => {
        const o = document.createElement('option');
        o.value = md;
        o.textContent = `Matchday ${md}`;
        matchdaySelect.appendChild(o);
      });

      clearAndAddPlaceholder(leagueMatchdaySelect, 'All');
      matchdays.forEach(md => {
        const o = document.createElement('option');
        o.value = md;
        o.textContent = `Matchday ${md}`;
        leagueMatchdaySelect.appendChild(o);
      });

      // Generate initial league table
      league = generateLeagueTable(matches);

      // --- Event Listeners ---
      teamSelect.addEventListener('change', () => { if(viewSelect.value==='matches') filterMatches(); });
      matchdaySelect.addEventListener('change', () => { if(viewSelect.value==='matches') filterMatches(); });
      leagueMatchdaySelect.addEventListener('change', () => { if(viewSelect.value==='league') renderLeagueTable(league, Number(leagueMatchdaySelect.value)); });
      viewSelect.addEventListener('change', () => {
        if(viewSelect.value==='league') {
          leagueSection.style.display='block';
          matchesSection.style.display='none';
          renderLeagueTable(league);
        } else if(viewSelect.value==='matches') {
          matchesSection.style.display='block';
          leagueSection.style.display='none';
          filterMatches();
        } else {
          matchesSection.style.display='none';
          leagueSection.style.display='none';
        }
      });
    })
    .catch(err => {
      console.error('Failed to load data:', err);
      matchesTableBody.innerHTML = '<tr><<td colspan="4">Error loading data — make sure json-server is running</td></tr>';
    });
});
