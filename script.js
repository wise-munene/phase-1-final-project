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
  const LEAGUE_URL  = 'http://localhost:3000/league';

  Promise.all([
    fetch(MATCHES_URL).then(r => r.json()),
    fetch(LEAGUE_URL).then(r => r.json())
  ])
  .then(([matches, league]) => {
    console.log('Loaded matches:', matches.length, 'Loaded league:', league.length);

    // Build dropdowns
    const matchdays = Array.from(new Set(matches.map(m => m.matchday))).sort((a,b)=>a-b);
    const teams = Array.from(new Set(matches.flatMap(m => [m.team1, m.team2]))).sort();

    function clearAndAddPlaceholder(selectEl, placeholderText) {
      selectEl.innerHTML = '';
      const ph = document.createElement('option');
      ph.value = '';
      ph.textContent = placeholderText;
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

    // Rendering functions
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

    function displayLeague(upToDay) {
      leagueTableBody.innerHTML = '';
      let items = league.slice();

      // (Optional) filter by matchday if you want dynamic standings
      if (upToDay) {
        items = items.filter(row => row.matchday <= upToDay);
      }

      items.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row.position}</td>
          <td>${row.team}</td>
          <td>${row.played}</td>
          <td>${row.won}</td>
          <td>${row.draw}</td>
          <td>${row.lost}</td>
          <td>${row.points}</td>
        `;
        leagueTableBody.appendChild(tr);
      });
    }

    function filterMatches() {
      let filtered = matches.slice();
      const selDay = matchdaySelect.value;
      const selTeam = teamSelect.value;

      if (selDay) filtered = filtered.filter(m => String(m.matchday) === String(selDay));
      if (selTeam) filtered = filtered.filter(m => m.team1 === selTeam || m.team2 === selTeam);

      displayMatches(filtered);
    }

    // Events
    teamSelect.addEventListener('change', () => {
      if (viewSelect.value === 'matches') filterMatches();
    });

    matchdaySelect.addEventListener('change', () => {
      if (viewSelect.value === 'matches') filterMatches();
    });

    leagueMatchdaySelect.addEventListener('change', () => {
      if (viewSelect.value === 'league') displayLeague(Number(leagueMatchdaySelect.value));
    });

    viewSelect.addEventListener('change', () => {
      if (viewSelect.value === 'league') {
        leagueSection.style.display = 'block';
        matchesSection.style.display = 'none';
        displayLeague();
      } else if (viewSelect.value === 'matches') {
        matchesSection.style.display = 'block';
        leagueSection.style.display = 'none';
        filterMatches();
      } else {
        matchesSection.style.display = 'none';
        leagueSection.style.display = 'none';
      }
    });
  })
  .catch(err => {
    console.error('Failed to load data:', err);
    matchesTableBody.innerHTML = '<tr><td colspan="4">Error loading data — make sure json-server is running</td></tr>';
  });
});
