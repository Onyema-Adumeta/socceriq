require("dotenv").config();
const { getTopScorers, LEAGUE_IDS } = require("./footballAPI");
const fs = require("fs");
const path = require("path");

async function fetchPhotos() {
  console.log("Fetching player photos from Football API...");
  const photoMap = {};
  const leagues = ["premierLeague", "laLiga", "bundesliga", "serieA", "ligue1"];

  for (const league of leagues) {
    console.log("Fetching " + league + "...");
    try {
      const res = await fetch(
        "https://v3.football.api-sports.io/players/topscorers?league=" + LEAGUE_IDS[league] + "&season=2024",
        { headers: { "x-rapidapi-key": process.env.FOOTBALL_API_KEY, "x-rapidapi-host": "v3.football.api-sports.io" } }
      );
      const data = await res.json();
      if (data.response) {
        data.response.forEach(item => {
          if (item.player && item.player.photo) {
            photoMap[item.player.name] = item.player.photo;
          }
        });
        console.log("Got " + data.response.length + " photos from " + league);
      }
    } catch(e) {
      console.log("Error: " + e.message);
    }
    await new Promise(r => setTimeout(r, 1200));
  }

  const output = "const PLAYER_PHOTOS = " + JSON.stringify(photoMap, null, 2) + ";\nmodule.exports = PLAYER_PHOTOS;";
  fs.writeFileSync(path.join(__dirname, "data", "playerPhotos.js"), output);
  console.log("Saved " + Object.keys(photoMap).length + " photos to data/playerPhotos.js");
  process.exit(0);
}

fetchPhotos().catch(console.error);