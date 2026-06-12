const BASE_URL = "/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const gameAPI = {
  start:       (difficulty) => apiFetch("/game/start", { method: "POST", body: JSON.stringify({ difficulty }) }),
  getClue:     (sessionId) => apiFetch("/game/clue", { method: "POST", body: JSON.stringify({ sessionId }) }),
  submitGuess: (sessionId, guess) => apiFetch("/game/guess", { method: "POST", body: JSON.stringify({ sessionId, guess }) }),
  getSession:  (sessionId) => apiFetch(`/game/session/${sessionId}`)
};

export const dailyAPI = {
  getToday:       () => apiFetch("/daily/today"),
  getClue:        (clueIndex) => apiFetch("/daily/clue", { method: "POST", body: JSON.stringify({ clueIndex }) }),
  submitGuess:    (guess) => apiFetch("/daily/guess", { method: "POST", body: JSON.stringify({ guess }) }),
  getHint:        (num) => apiFetch(`/daily/hint/${num}`),
  complete:       (name, score, guessesUsed, cluesUsed) => apiFetch("/daily/complete", { method: "POST", body: JSON.stringify({ name, score, guessesUsed, cluesUsed }) }),
  getLeaderboard: () => apiFetch("/daily/leaderboard")
};

export const flashcardAPI = {
  getDecks: () => apiFetch("/flashcards"),
  getDeck:  (deckId) => apiFetch(`/flashcards/${deckId}`)
};

export const leaderboardAPI = {
  get: () => apiFetch("/leaderboard"),
  add: (name, score, playerName, difficulty) => apiFetch("/leaderboard", { method: "POST", body: JSON.stringify({ name, score, playerName, difficulty }) })
};

export const playersAPI = {
  getAll: (params = {}) => { const qs = new URLSearchParams(params).toString(); return apiFetch(`/players${qs ? "?" + qs : ""}`); },
  getOne: (id) => apiFetch(`/players/${id}`)
};

export const chatAPI = {
  sendMessage: (message, conversationHistory = [], sessionId = null) =>
    apiFetch("/chat", { method: "POST", body: JSON.stringify({ message, conversationHistory, sessionId }) })
};