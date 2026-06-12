const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;
const FOOTBALL_API_URL = process.env.FOOTBALL_API_URL || "https://v3.football.api-sports.io";

async function fetchFromAPI(endpoint) {
  try {
    const response = await fetch(`${FOOTBALL_API_URL}${endpoint}`, {
      headers: {
        "x-rapidapi-key": FOOTBALL_API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io"
      }
    });
    if (!response.ok) throw new Error("API request failed");
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Football API error:", error.message);
    return null;
  }
}

async function getPlayersByTeam(teamId, season = 2024) {
  const data = await fetchFromAPI(`/players?team=${teamId}&season=${season}`);
  if (!data) return [];
  return data.map(item => formatPlayer(item));
}

async function getPlayersByLeague(leagueId, season = 2024) {
  const data = await fetchFromAPI(`/players?league=${leagueId}&season=${season}&page=1`);
  if (!data) return [];
  return data.map(item => formatPlayer(item));
}

async function searchPlayer(name) {
  const data = await fetchFromAPI(`/players?search=${encodeURIComponent(name)}`);
  if (!data) return [];
  return data.map(item => formatPlayer(item));
}

async function getTopScorers(leagueId, season = 2024) {
  const data = await fetchFromAPI(`/players/topscorers?league=${leagueId}&season=${season}`);
  if (!data) return [];
  return data.map(item => formatPlayer(item));
}

async function getTopAssists(leagueId, season = 2024) {
  const data = await fetchFromAPI(`/players/topassists?league=${leagueId}&season=${season}`);
  if (!data) return [];
  return data.map(item => formatPlayer(item));
}

function formatPlayer(item) {
  const player = item.player;
  const stats = item.statistics?.[0];
  return {
    apiId: player.id,
    name: player.name,
    firstname: player.firstname,
    lastname: player.lastname,
    nationality: player.nationality,
    age: player.age,
    height: player.height,
    weight: player.weight,
    photo: player.photo,
    position: stats?.games?.position || "Unknown",
    currentClub: stats?.team?.name || "Unknown",
    league: stats?.league?.name || "Unknown",
    season: stats?.league?.season,
    stats: {
      goals: stats?.goals?.total || 0,
      assists: stats?.goals?.assists || 0,
      appearances: stats?.games?.appearences || 0,
      yellowCards: stats?.cards?.yellow || 0,
      redCards: stats?.cards?.red || 0,
      rating: stats?.games?.rating || "N/A"
    }
  };
}

const LEAGUE_IDS = {
  premierLeague: 39,
  laLiga: 140,
  bundesliga: 78,
  serieA: 135,
  ligue1: 61,
  championsLeague: 2,
  mls: 253,
  africanNations: 6,
  worldCup: 1
};

const TEAM_IDS = {
  manchester_city: 50,
  liverpool: 40,
  arsenal: 42,
  chelsea: 49,
  manchester_united: 33,
  tottenham: 47,
  real_madrid: 541,
  barcelona: 529,
  atletico_madrid: 530,
  psg: 85,
  bayern_munich: 157,
  borussia_dortmund: 165,
  juventus: 496,
  ac_milan: 489,
  inter_milan: 505
};

module.exports = { getPlayersByTeam, getPlayersByLeague, searchPlayer, getTopScorers, getTopAssists, formatPlayer, LEAGUE_IDS, TEAM_IDS };