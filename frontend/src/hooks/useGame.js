import { useState, useCallback } from "react";
import { gameAPI, leaderboardAPI } from "../api";

export const GAME_STATE = { IDLE: "idle", PLAYING: "playing", WON: "won", LOST: "lost" };

export default function useGame() {
  const [state, setState] = useState(GAME_STATE.IDLE);
  const [sessionId, setSessionId] = useState(null);
  const [clues, setClues] = useState([]);
  const [guessesLeft, setGuessesLeft] = useState(5);
  const [guessesUsed, setGuessesUsed] = useState(0);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState("all");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [streak, setStreak] = useState(0);

  const startGame = useCallback(async (diff = "all") => {
    setIsLoading(true); setError(null);
    try {
      const data = await gameAPI.startGame(diff);
      setSessionId(data.sessionId); setClues([data.firstClue]);
      setGuessesLeft(data.maxGuesses); setGuessesUsed(0); setScore(0);
      setResult(null); setDifficulty(diff); setState(GAME_STATE.PLAYING);
    } catch (e) { setError(e.message); } finally { setIsLoading(false); }
  }, []);

  const getNextClue = useCallback(async () => {
    if (!sessionId || state !== GAME_STATE.PLAYING) return;
    setIsLoading(true);
    try { const data = await gameAPI.getNextClue(sessionId); if (data.clue) setClues(prev => [...prev, data.clue]); return data; }
    catch (e) { setError(e.message); } finally { setIsLoading(false); }
  }, [sessionId, state]);

  const submitGuess = useCallback(async (guess) => {
    if (!sessionId || !guess.trim()) return;
    setIsLoading(true); setError(null);
    try {
      const data = await gameAPI.submitGuess(sessionId, guess);
      setGuessesUsed(data.guessesUsed); setGuessesLeft(data.guessesLeft);
      if (data.correct) { setScore(data.score); setResult(data.playerData); setState(GAME_STATE.WON); setStreak(s => s + 1); }
      else if (data.gameOver) { setResult(data.playerData); setState(GAME_STATE.LOST); setStreak(0); }
      return data;
    } catch (e) { setError(e.message); } finally { setIsLoading(false); }
  }, [sessionId]);

  const reset = useCallback(() => {
    setState(GAME_STATE.IDLE); setSessionId(null); setClues([]); setGuessesLeft(5);
    setGuessesUsed(0); setScore(0); setResult(null); setError(null);
  }, []);

  const submitToLeaderboard = useCallback(async (playerName) => {
    if (!score || !playerName) return;
    try { const data = await leaderboardAPI.submit(playerName, score, result?.name || "Unknown", difficulty); return data.leaderboard; }
    catch (e) { console.error("Leaderboard error:", e); }
  }, [score, result, difficulty]);

  return { state, sessionId, clues, guessesLeft, guessesUsed, score, difficulty, result, isLoading, error, streak, startGame, getNextClue, submitGuess, reset, submitToLeaderboard };
}