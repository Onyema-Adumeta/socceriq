require("dotenv").config();
const { getTopScorers, LEAGUE_IDS } = require("./footballAPI");
const fs = require("fs");

function generateClues(player) {
  const clues = [];
  clues.push("I am " + player.nationality + " and play as a " + (player.position || "footballer") + ".");
  clues.push("I currently play for " + (player.currentClub || "a professional club") + ".");
  if (player.stats && player.stats.goals > 20) clues.push("I have scored over " + player.stats.goals + " goals this season.");
  if (player.stats && player.stats.assists > 5) clues.push("I have provided " + player.stats.assists + " assists.");
  if (player.height) clues.push("I stand " + player.height + " tall.");
  if (player.age) clues.push("I am " + player.age + " years old.");
  clues.push("I am a professional footballer competing in one of Europes top leagues.");
  while (clues.length < 7) clues.push("I am known for my skill and dedication to the game.");
  return clues.slice(0, 7);
}

function determineDifficulty(player) {
  const famous = ["Messi","Ronaldo","Mbappe","Haaland","Neymar","Salah","Benzema","Lewandowski","Kane","Vinicius"];
  if (famous.some(n => player.name.includes(n))) return "easy";
  if (player.stats && (player.stats.goals > 15 || player.stats.appearances > 30)) return "medium";
  return "hard";
}

async function importPlayers() {
  console.log("Fetching players from Football API...");
  const allPlayers = [];
  let nextId = 300;
  const leagues = ["premierLeague", "laLiga", "bundesliga", "serieA", "ligue1"];

  for (const league of leagues) {
    console.log("Fetching top scorers from " + league + "...");
    try {
      const players = await getTopScorers(LEAGUE_IDS[league]);
      if (players && players.length > 0) {
        for (const p of players) {
          allPlayers.push({
            id: nextId++,
            name: p.name,
            nationality: p.nationality || "Unknown",
            position: p.position || "Forward",
            currentClub: p.currentClub || "Unknown",
            formerClubs: [],
            league: p.league || league,
            age: p.age || null,
            height: p.height || "Unknown",
            number: 0,
            trophies: [],
            stats: p.stats || { goals: 0, assists: 0, appearances: 0 },
            famousMoments: [],
            difficulty: determineDifficulty(p),
            clues: generateClues(p),
            emoji: p.name.split(" ").map(function(n) { return n[0]; }).join(""),
            category: "player",
            photo: p.photo || null
          });
        }
        console.log("Added " + players.length + " players from " + league);
      } else {
        console.log("No players returned from " + league);
      }
    } catch (err) {
      console.log("Error fetching " + league + ": " + err.message);
    }
    await new Promise(function(resolve) { setTimeout(resolve, 1500); });
  }

  if (allPlayers.length === 0) {
    console.log("No players fetched - check your API key in .env");
    process.exit(1);
  }

  const output = "const API_PLAYERS = " + JSON.stringify(allPlayers, null, 2) + ";\nmodule.exports = API_PLAYERS;";
  fs.writeFileSync("./data/apiPlayers.js", output);
  console.log("Done! Saved " + allPlayers.length + " players to data/apiPlayers.js");
  process.exit(0);
}

importPlayers().catch(function(err) {
  console.error("Import failed:", err.message);
  process.exit(1);
});