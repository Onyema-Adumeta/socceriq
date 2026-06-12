require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { PLAYERS, FLASHCARD_DECKS, FACTS } = require("./data/players");
const gameSession = require("./gameSession");
const { getAIResponse } = require("./aiHandler");
const { getPlayersByTeam, getPlayersByLeague, searchPlayer, getTopScorers, LEAGUE_IDS, TEAM_IDS } = require("./footballAPI");
const { getDailyPlayer, getDailyLeaderboard, addToDailyLeaderboard, getTodayKey, getDailyHint } = require("./dailyChallenge");

let PLAYER_PHOTOS = {};
try { PLAYER_PHOTOS = require("./data/playerPhotos"); } catch(e) { console.log("No photo cache yet"); }

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, "public")));
app.use(cors({ origin: "*", methods: ["GET", "POST", "DELETE"] }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.get("/api/photo", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "URL required" });
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept": "image/*" }
    });
    if (!response.ok) return res.status(404).send("Not found");
    const buffer = await response.arrayBuffer();
    res.set("Content-Type", response.headers.get("content-type") || "image/png");
    res.set("Cache-Control", "public, max-age=86400");
    res.send(Buffer.from(buffer));
  } catch(e) { res.status(500).send("Error: " + e.message); }
});

app.post("/api/game/start", (req, res) => {
  try {
    const { difficulty = "all" } = req.body;
    const session = gameSession.createSession(PLAYERS, difficulty);
    res.json({ success: true, ...session });
  } catch (err) { res.status(500).json({ error: "Failed to start game" }); }
});

app.post("/api/game/clue", (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: "Session ID required" });
  const result = gameSession.getNextClue(sessionId);
  if (!result) return res.status(404).json({ error: "Session not found or game over" });
  res.json({ success: true, ...result });
});

app.post("/api/game/guess", (req, res) => {
  const { sessionId, guess } = req.body;
  if (!sessionId || !guess) return res.status(400).json({ error: "Session ID and guess required" });
  const result = gameSession.submitGuess(sessionId, guess, PLAYERS);
  if (result.error) return res.status(400).json(result);
  res.json({ success: true, ...result });
});

app.get("/api/game/session/:sessionId", (req, res) => {
  const session = gameSession.getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "Session not found" });
  res.json({ success: true, cluesRevealed: session.cluesRevealed, guessesUsed: session.guessesUsed, guessesLeft: session.maxGuesses - session.guessesUsed, solved: session.solved, failed: session.failed, score: session.score, revealedClues: session.clues.slice(0, session.cluesRevealed + 1) });
});

app.get("/api/leaderboard", (req, res) => res.json({ success: true, leaderboard: gameSession.getLeaderboard() }));

app.post("/api/leaderboard", (req, res) => {
  const { name, score, playerName, difficulty } = req.body;
  if (!name || !score) return res.status(400).json({ error: "Name and score required" });
  const leaderboard = gameSession.addToLeaderboard(name, score, playerName, difficulty);
  res.json({ success: true, leaderboard });
});

app.get("/api/flashcards", (req, res) => res.json({ success: true, decks: FLASHCARD_DECKS }));

app.get("/api/flashcards/:deckId", (req, res) => {
  const deck = FLASHCARD_DECKS.find(d => d.id === req.params.deckId);
  if (!deck) return res.status(404).json({ error: "Deck not found" });
  res.json({ success: true, deck });
});

app.get("/api/players", (req, res) => {
  const { search, difficulty, nationality } = req.query;
  let result = PLAYERS.filter(p => p.category === "player");
  if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  if (difficulty && difficulty !== "all") result = result.filter(p => p.difficulty === difficulty);
  if (nationality) result = result.filter(p => p.nationality.toLowerCase().includes(nationality.toLowerCase()));
  const safeResult = result.map(({ clues, ...rest }) => {
    let photo = PLAYER_PHOTOS[rest.name] || rest.photo || null;
    if (!photo) {
      const nameParts = rest.name.split(" ");
      const abbrev = nameParts[0][0] + ". " + nameParts.slice(1).join(" ");
      photo = PLAYER_PHOTOS[abbrev] || null;
    }
    if (photo && photo.startsWith("/photos/")) photo = photo;
    return { ...rest, photo };
  });
  res.json({ success: true, count: safeResult.length, players: safeResult });
});

app.get("/api/players/:id", (req, res) => {
  const player = PLAYERS.find(p => p.id === parseInt(req.params.id));
  if (!player) return res.status(404).json({ error: "Player not found" });
  const { clues, ...safePlayer } = player;
  res.json({ success: true, player: { ...safePlayer, photo: PLAYER_PHOTOS[safePlayer.name] || safePlayer.photo || null } });
});

app.get("/api/facts/random", (req, res) => {
  const pool = FACTS;
  res.json({ success: true, ...pool[Math.floor(Math.random() * pool.length)] });
});

app.post("/api/chat", async (req, res) => {
  const { message, conversationHistory = [], sessionId } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });
  let gameContext = null;
  if (sessionId) {
    const session = gameSession.getSession(sessionId);
    if (session && !session.solved && !session.failed) {
      gameContext = { playerName: session.playerName, cluesRevealed: session.cluesRevealed, guessesUsed: session.guessesUsed, guessesLeft: session.maxGuesses - session.guessesUsed };
    }
  }
  const reply = await getAIResponse(message, conversationHistory, gameContext);
  res.json({ success: true, reply });
});

app.get("/api/football/search/:name", async (req, res) => {
  try {
    const players = await searchPlayer(req.params.name);
    res.json({ success: true, count: players.length, players });
  } catch (err) { res.status(500).json({ error: "Search failed" }); }
});

app.get("/api/football/topscorers/:league", async (req, res) => {
  try {
    const leagueId = LEAGUE_IDS[req.params.league] || req.params.league;
    const players = await getTopScorers(leagueId);
    res.json({ success: true, count: players.length, players });
  } catch (err) { res.status(500).json({ error: "Failed to get top scorers" }); }
});

app.get("/api/football/team/:teamId", async (req, res) => {
  try {
    const teamId = TEAM_IDS[req.params.teamId] || req.params.teamId;
    const players = await getPlayersByTeam(teamId);
    res.json({ success: true, count: players.length, players });
  } catch (err) { res.status(500).json({ error: "Failed to get team players" }); }
});

app.get("/api/football/league/:leagueId", async (req, res) => {
  try {
    const leagueId = LEAGUE_IDS[req.params.leagueId] || req.params.leagueId;
    const players = await getPlayersByLeague(leagueId);
    res.json({ success: true, count: players.length, players });
  } catch (err) { res.status(500).json({ error: "Failed to get league players" }); }
});

app.get("/api/daily/today", (req, res) => {
  try {
    const { player, date } = getDailyPlayer();
    res.json({ success: true, date, firstClue: player.clues[0], totalClues: player.clues.length, difficulty: player.difficulty, maxGuesses: 3, isRare: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/daily/clue", (req, res) => {
  try {
    const { clueIndex } = req.body;
    const { player } = getDailyPlayer();
    if (clueIndex >= player.clues.length) return res.json({ clue: null, allCluesShown: true });
    res.json({ success: true, clue: player.clues[clueIndex], clueIndex, allCluesShown: clueIndex >= player.clues.length - 1 });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/daily/guess", (req, res) => {
  try {
    const { guess } = req.body;
    if (!guess) return res.status(400).json({ error: "Guess required" });
    const { player, date } = getDailyPlayer();
    const ng = guess.toLowerCase().trim();
    const na = player.name.toLowerCase();
    const isCorrect = na.includes(ng) || ng.includes(na) ||
      na.split(" ").some(part => ng.split(" ").some(gp =>
        part.length > 3 && gp.length > 3 && (part.includes(gp) || gp.includes(part))
      ));
    res.json({ success: true, correct: isCorrect, answer: player.name, playerData: isCorrect ? player : null, date });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/daily/hint/:num", (req, res) => {
  try {
    const hint = getDailyHint(parseInt(req.params.num));
    res.json({ success: true, hint });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/daily/complete", (req, res) => {
  try {
    const { name, score, guessesUsed, cluesUsed } = req.body;
    if (!name || score === undefined) return res.status(400).json({ error: "Name and score required" });
    const leaderboard = addToDailyLeaderboard(name, score, guessesUsed, cluesUsed);
    res.json({ success: true, leaderboard });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/daily/leaderboard", (req, res) => {
  res.json({ success: true, date: getTodayKey(), leaderboard: getDailyLeaderboard() });
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

app.post("/api/admin/player", (req, res) => {
  try {
    const newPlayer = req.body;
    if (!newPlayer.name || !newPlayer.clues) return res.status(400).json({ error: "Name and clues required" });
    const filePath = path.join(__dirname, "data", "customPlayers.js");
    let existing = [];
    if (fs.existsSync(filePath)) {
      delete require.cache[require.resolve(filePath)];
      existing = require(filePath);
    }
    newPlayer.id = Date.now();
    existing.push(newPlayer);
    const content = "const CUSTOM_PLAYERS = " + JSON.stringify(existing, null, 2) + ";\nmodule.exports = CUSTOM_PLAYERS;";
    fs.writeFileSync(filePath, content);
    PLAYERS.push(newPlayer);
    res.json({ success: true, message: "Player added!", player: newPlayer });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/admin/stats", (req, res) => {
  res.json({ success: true, total: PLAYERS.length, easy: PLAYERS.filter(p => p.difficulty === "easy").length, medium: PLAYERS.filter(p => p.difficulty === "medium").length, hard: PLAYERS.filter(p => p.difficulty === "hard").length });
});

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

app.listen(PORT, () => {
  console.log("\n  Soccer Who Am I - Backend running on port " + PORT);
  console.log("  Players: " + PLAYERS.length + " | Decks: " + FLASHCARD_DECKS.length);
  console.log("  AI: " + (process.env.OPENROUTER_API_KEY ? "Connected" : "Fallback mode"));
  console.log("  Football API: " + (process.env.FOOTBALL_API_KEY ? "Connected" : "No key"));
  console.log("  Admin Panel: http://localhost:" + PORT + "/admin\n");
});

module.exports = app;