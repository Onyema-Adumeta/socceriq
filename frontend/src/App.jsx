import { useState, useEffect } from "react";
import GamePage from "./pages/GamePage";
import FlashcardsPage from "./pages/FlashcardsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import PlayersPage from "./pages/PlayersPage";
import DailyChallengePage from "./pages/DailyChallengePage";
import AchievementsPage from "./pages/AchievementsPage";
import Nav from "./components/Nav";
import ChatBot from "./components/ChatBot";
import "./styles/global.css";

export default function App() {
  const [page, setPage] = useState("game");
  const [darkMode, setDarkMode] = useState(true);
  useEffect(() => { document.body.setAttribute("data-theme", darkMode ? "dark" : "light"); }, [darkMode]);
  const pages = { game: GamePage, daily: DailyChallengePage, achievements: AchievementsPage, flashcards: FlashcardsPage, leaderboard: LeaderboardPage, players: PlayersPage };
  const CurrentPage = pages[page] || GamePage;
  return (
    <div className="app">
      <Nav currentPage={page} setPage={setPage} theme={darkMode ? "dark" : "light"} setTheme={(fn) => setDarkMode(prev => fn(prev ? "dark" : "light") === "dark")} />
      <main className="app-main"><CurrentPage /></main>
      <ChatBot />
    </div>
  );
}