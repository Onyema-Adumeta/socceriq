const { v4: uuidv4 } = require("uuid");

class GameSessionManager {
  constructor() {
    this.sessions = new Map();
    this.leaderboard = [];
    setInterval(() => this.cleanupSessions(), 30 * 60 * 1000);
  }

  getMaxClues(difficulty) {
    if (difficulty === "easy") return 7;
    if (difficulty === "medium") return 5;
    if (difficulty === "hard") return 3;
    return 7;
  }

  getMaxGuesses(difficulty) {
    if (difficulty === "easy") return 7;
    if (difficulty === "medium") return 5;
    if (difficulty === "hard") return 3;
    return 5;
  }

  createSession(players, difficulty = "all") {
    const sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 7);
    const eligible = difficulty === "all" ? players : players.filter(p => p.difficulty === difficulty);
    const playerPool = [...eligible].sort(() => Math.random() - 0.5);
    const chosen = playerPool[0];
    const maxClues = this.getMaxClues(difficulty === "all" ? chosen.difficulty : difficulty);
    const maxGuesses = this.getMaxGuesses(difficulty === "all" ? chosen.difficulty : difficulty);
    const limitedClues = chosen.clues.slice(0, maxClues);
    const session = {
      id: sessionId,
      playerId: chosen.id,
      playerName: chosen.name,
      clues: limitedClues,
      cluesRevealed: 0,
      guessesUsed: 0,
      maxGuesses: maxGuesses,
      maxClues: maxClues,
      score: 0,
      startTime: Date.now(),
      solved: false,
      failed: false,
      difficulty
    };
    this.sessions.set(sessionId, session);
    return {
      sessionId,
      firstClue: limitedClues[0],
      difficulty,
      maxGuesses: maxGuesses,
      maxClues: maxClues
    };
  }

  getSession(sessionId) { return this.sessions.get(sessionId); }

  getNextClue(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session || session.solved || session.failed) return null;
    const nextIndex = session.cluesRevealed + 1;
    if (nextIndex >= session.clues.length) return { clue: null, cluesRevealed: session.cluesRevealed, allCluesShown: true };
    session.cluesRevealed = nextIndex;
    this.sessions.set(sessionId, session);
    return {
      clue: session.clues[nextIndex],
      cluesRevealed: session.cluesRevealed,
      allCluesShown: nextIndex >= session.clues.length - 1
    };
  }

  submitGuess(sessionId, guess, players) {
    const session = this.sessions.get(sessionId);
    if (!session) return { error: "Session not found" };
    if (session.solved) return { error: "Already solved", correct: true };
    if (session.failed) return { error: "Game over", correct: false };
    const player = players.find(p => p.id === session.playerId);
    const ng = guess.toLowerCase().trim();
    const na = player.name.toLowerCase();
    const isCorrect = na.includes(ng) || ng.includes(na) || this.fuzzyMatch(ng, na);
    session.guessesUsed++;
    if (isCorrect) {
      const timeBonus = Math.max(0, 300 - Math.floor((Date.now() - session.startTime) / 1000));
      const clueBonus = Math.max(0, (session.maxClues - session.cluesRevealed) * 100);
      const guessBonus = Math.max(0, (session.maxGuesses - session.guessesUsed + 1) * 50);
      const difficultyBonus = session.difficulty === "hard" ? 500 : session.difficulty === "medium" ? 250 : 0;
      session.score = 500 + timeBonus + clueBonus + guessBonus + difficultyBonus;
      session.solved = true;
    } else if (session.guessesUsed >= session.maxGuesses) {
      session.failed = true;
    }
    this.sessions.set(sessionId, session);
    return {
      correct: isCorrect,
      guessesUsed: session.guessesUsed,
      guessesLeft: session.maxGuesses - session.guessesUsed,
      score: isCorrect ? session.score : 0,
      gameOver: session.solved || session.failed,
      answer: (session.solved || session.failed) ? player.name : null,
      playerData: (session.solved || session.failed) ? player : null
    };
  }

  fuzzyMatch(guess, answer) {
    const ap = answer.split(" "); const gp = guess.split(" ");
    return ap.some(part => gp.some(gPart => part.length > 3 && gPart.length > 3 && (part.includes(gPart) || gPart.includes(part))));
  }

  addToLeaderboard(name, score, playerName, difficulty) {
    this.leaderboard.push({ name, score, playerName, difficulty, date: new Date().toISOString() });
    this.leaderboard.sort((a, b) => b.score - a.score);
    this.leaderboard = this.leaderboard.slice(0, 50);
    return this.leaderboard.slice(0, 10);
  }

  getLeaderboard() { return this.leaderboard.slice(0, 10); }

  cleanupSessions() {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.startTime > 60 * 60 * 1000) this.sessions.delete(id);
    }
  }
}

module.exports = new GameSessionManager();