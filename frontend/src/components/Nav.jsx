export default function Nav({ currentPage, setPage, theme, setTheme }) {
  const links = [
    { id: "game", label: "Who Am I?" },
    { id: "daily", label: "Daily" },
    { id: "achievements", label: "Achievements" },
    { id: "flashcards", label: "Flashcards" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "players", label: "Players" }
  ];

  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => setPage("game")}>
        <div className="nav-logo-icon">⚽</div>
        <div className="nav-logo-text">Football<span>Genius</span></div>
      </div>
      <ul className="nav-links">
        {links.map(l => (
          <li key={l.id}>
            <button
              className={"nav-link" + (currentPage === l.id ? " active" : "")}
              onClick={() => setPage(l.id)}
            >
              {l.label}
            </button>
          </li>
        ))}
      </ul>
      <button className="nav-theme-btn" onClick={setTheme}>
        {theme === "dark" ? "☀ Light" : "☾ Dark"}
      </button>
    </nav>
  );
}