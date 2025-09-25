fetch('http://localhost:3000/api/matches')
  .then(res => res.json())
  .then(data => {
    // DOM elements
    const matchdaySelect = document.getElementById('matchday-select');
    const teamSelect = document.getElementById('team-select');
    const tableBody = document.querySelector('#matches-table tbody');
    const leagueSelect = document.getElementById('league-matchday-select');
    const leagueTableBody = document.querySelector('#league-table tbody');

    // --- Populate dropdowns ---
    const matchdays = [...new Set(data.map(m => m.matchday))];
    const teams = [...new Set(data.flatMap(m => [m.team1, m.team2]))];

    // Matches dropdowns
    matchdays.forEach(md => {
      const option = document.createElement('option');
      option.value = md;
      option.textContent = `Matchday ${md}`;
      matchdaySelect.appendChild(option);
    });

    teams.forEach(team => {
      const option = document.createElement('option');
      option.value = team;
      option.textContent = team;
      teamSelect.appendChild(option);
    });

    // League table dropdown
    matchdays.forEach(md => {
      const option = document.createElement('option');
      option.value = md;
      option.textContent = `Matchday ${md}`;
      leagueSelect.appendChild(option);
    });

    // --- Functions ---
    function displayMatches(filteredMatches) {
      tableBody.innerHTML = '';
      filteredMatches.forEach(match => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${match.date}</td>
          <td>${match.team1}</td>
          <td>${match.score}</td>
          <td>${match.team2}</td>
        `;
        tableBody.appendChild(row);
      });
    }

    function filterMatches() {
      const selectedDay = matchdaySelect.value;
      const selectedTeam = teamSelect.value;
      let filtered = data;

      if (selectedDay) filtered = filtered.filter(m => m.matchday == selectedDay);
      if (selectedTeam) filtered = filtered.filter(m => m.team1 === selectedTeam || m.team2 === selectedTeam);

      displayMatches(filtered);
    }

    function displayLeagueTable(selectedDay) {
      const filteredMatches = selectedDay ? data.filter(m => m.matchday <= selectedDay) : data;

      const standings = {};
      filteredMatches.forEach(match => {
        [match.team1, match.team2].forEach(team => {
          if (!standings[team]) standings[team] = { played: 0, won: 0, draw: 0, lost: 0, points: 0 };
        });

        const [score1, score2] = match.score.split('-').map(Number);
        standings[match.team1].played += 1;
        standings[match.team2].played += 1;

        if (score1 > score2) {
          standings[match.team1].won += 1;
          standings[match.team1].points += 3;
          standings[match.team2].lost += 1;
        } else if (score1 < score2) {
          standings[match.team2].won += 1;
          standings[match.team2].points += 3;
          standings[match.team1].lost += 1;
        } else {
          standings[match.team1].draw += 1;
          standings[match.team1].points += 1;
          standings[match.team2].draw += 1;
          standings[match.team2].points += 1;
        }
      });

      const sortedStandings = Object.entries(standings)
        .map(([team, stats]) => ({ team, ...stats }))
        .sort((a, b) => b.points - a.points);

      leagueTableBody.innerHTML = '';
      sortedStandings.forEach((teamData, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${teamData.team}</td>
          <td>${teamData.played}</td>
          <td>${teamData.won}</td>
          <td>${teamData.draw}</td>
          <td>${teamData.lost}</td>
          <td>${teamData.points}</td>
        `;
        leagueTableBody.appendChild(row);
      });
    }

    // --- Event listeners ---
    matchdaySelect.addEventListener('change', filterMatches);
    teamSelect.addEventListener('change', filterMatches);
    leagueSelect.addEventListener('change', () => {
      displayLeagueTable(Number(leagueSelect.value));
    });

    // --- Initial display ---
    displayMatches(data);s
    displayLeagueTable();
  })
  .catch(err => console.error('Error fetching matches:', err));

