const { PLAYERS } = require("./data/players");

const dailyChallenges = new Map();

function getTodayKey() {
  const now = new Date();
  return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
}

function getDailyPlayer() {
  const today = getTodayKey();
  if (dailyChallenges.has(today)) return dailyChallenges.get(today);

  const rarePlayers = PLAYERS.filter(p =>
    p.category === "player" &&
    p.clues &&
    p.clues.length >= 3 &&
    (
      p.difficulty === "hard" ||
      (p.difficulty === "medium" && p.stats && p.stats.goals < 100) ||
      (p.formerClubs && p.formerClubs.length > 3) ||
      (p.league && ["Saudi Pro League","MLS","Turkish Super Lig","Eredivisie","Primeira Liga","Scottish Premiership"].includes(p.league))
    )
  );

  const pool = rarePlayers.length > 20 ? rarePlayers : PLAYERS.filter(p => p.category === "player" && p.clues && p.clues.length >= 3);
  const dateNum = parseInt(today.replace(/-/g, ""));
  const index = dateNum % pool.length;
  const player = pool[index];

  const result = { player, date: today };
  dailyChallenges.set(today, result);
  return result;
}

function getDailyLeaderboard() {
  const today = getTodayKey();
  const key = "daily_lb_" + today;
  return global[key] || [];
}

function addToDailyLeaderboard(name, score, guessesUsed, cluesUsed) {
  const today = getTodayKey();
  const key = "daily_lb_" + today;
  if (!global[key]) global[key] = [];
  const existing = global[key].findIndex(e => e.name.toLowerCase() === name.toLowerCase());
  const entry = { name, score, guessesUsed, cluesUsed, date: today, time: new Date().toISOString() };
  if (existing >= 0) global[key][existing] = entry;
  else global[key].push(entry);
  global[key].sort((a, b) => b.score - a.score);
  global[key] = global[key].slice(0, 100);
  return global[key].slice(0, 10);
}

function getDailyHint(hintNumber) {
  const { player } = getDailyPlayer();
  const hints = [
    "This player is " + player.nationality + ".",
    "They play as a " + player.position + ".",
    "Their current club is " + player.currentClub + ".",
    "They have scored " + (player.stats?.goals || 0) + " career goals.",
    "They stand " + (player.height || "unknown height") + " tall.",
    "They wear number " + (player.number || "unknown") + ".",
    "They are aged " + (player.age || "unknown") + "."
  ];
  return hints[hintNumber] || null;
}

module.exports = { getDailyPlayer, getDailyLeaderboard, addToDailyLeaderboard, getTodayKey, getDailyHint };