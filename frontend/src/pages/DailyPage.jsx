import { useState, useEffect } from "react";
const API = "/api/daily";
function getTodayKey() {
  const now = new Date();
  return now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2,"0") + "-" + String(now.getDate()).padStart(2,"0");
}
export default function DailyPage() {
  const [phase, setPhase] = useState("loading");
  const [clues, setClues] = useState([]);
  const [guess, setGuess] = useState("");
  const [guessNum, setGuessNum] = useState(1);
  const [result, setResult] = useState(null);
  const [date, setDate] = useState("");
  const [totalClues, setTotalClues] = useState(6);
  const [clueIndex, setClueIndex] = useState(1);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem("playerName") || "");
  const [saved, setSaved] = useState(false);
  const [showLB, setShowLB] = useState(false);
  const MAX_GUESSES = 6;
  useEffect(() => {
    const todayKey = getTodayKey();
    const played = localStorage.getItem("daily_played_" + todayKey);
    if (played) {
      const data = JSON.parse(played);
      setResult(data.result); setClues(data.clues); setDate(todayKey);
      setAlreadyPlayed(true); setPhase("result"); return;
    }
    fetch(API + "/today").then(r => r.json()).then(data => {
      setDate(data.date); setClues([data.firstClue]); setTotalClues(data.totalClues); setPhase("playing");
    }).catch(() => setPhase("error"));
  }, []);
  const getNextClue = async () => {
    if (clueIndex >= totalClues) return;
    const r = await fetch(API + "/clue/" + clueIndex);
    const data = await r.json();
    if (data.clue) { setClues(c => [...c, data.clue]); setClueIndex(i => i + 1); }
  };
  const submitGuess = async () => {
    if (!guess.trim()) return;
    const r = await fetch(API + "/guess", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ guess, cluesUsed: clues.length, guessNumber: guessNum }) });
    const data = await r.json();
    setGuessNum(g => g + 1);
    if (data.gameOver) {
      const rd = { ...data, cluesUsed: clues.length, guessesUsed: guessNum };
      setResult(rd); setPhase("result");
      localStorage.setItem("daily_played_" + getTodayKey(), JSON.stringify({ result: rd, clues }));
    }
    setGuess("");
  };
  const saveScore = async () => {
    if (!playerName.trim() || !result?.correct) return;
    localStorage.setItem("playerName", playerName);
    const r = await fetch(API + "/leaderboard", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ name: playerName, score: result.score, guessesUsed: result.guessesUsed, cluesUsed: result.cluesUsed }) });
    const data = await r.json();
    setLeaderboard(data.leaderboard || []); setSaved(true); setShowLB(true);
  };
  const shareResult = () => {
    const emoji = result?.correct ? "\uD83C\uDF89" : "\uD83D\uDE14";
    const text = "SoccerIQ Daily Challenge " + date + "\n" + emoji + " " + (result?.correct ? "Correct in " + result.guessesUsed + " guess" + (result.guessesUsed > 1 ? "es" : "") : "Did not get it") + " | " + clues.length + " clues\nPlay at SoccerIQ!";
    if (navigator.share) { navigator.share({ title: "SoccerIQ Daily", text }); }
    else { navigator.clipboard.writeText(text); alert("Copied to clipboard!"); }
  };
  if (phase === "loading") return (<div className="game-page" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}><div style={{color:"var(--teal)",fontSize:"1.2rem"}}>Loading today's challenge...</div></div>);
  if (phase === "error") return (<div className="game-page" style={{textAlign:"center",padding:"60px 24px"}}><h2>Could not load today's challenge</h2><p style={{color:"var(--muted)"}}>Make sure the backend is running.</p></div>);
  return (
    <div className="game-page">
      <div className="daily-header">
        <div className="daily-title">\uD83D\uDCC5 Daily Challenge</div>
        <div className="daily-date">{date}</div>
        <div className="daily-subtitle">One player. One day. Everyone plays the same.</div>
      </div>
      {phase === "playing" && (<div className="game-card" style={{maxWidth:"640px",margin:"0 auto"}}>
        <div className="game-card-header"><div className="game-status">
          <div className="game-stat"><div className="game-stat-val">{clues.length}</div><div className="game-stat-label">Clues</div></div>
          <div className="game-stat"><div className="game-stat-val">{MAX_GUESSES - guessNum + 1}</div><div className="game-stat-label">Guesses Left</div></div>
        </div>
        <div className="guess-dots">{Array.from({length:MAX_GUESSES}).map((_,i) => (<div key={i} className={"guess-dot"+(i<guessNum-1?" used":i===guessNum-1?" active":"")}/>))}</div>
        </div>
        <div className="clues-list">{clues.map((c,i) => (<div key={i} className="clue-item"><span className="clue-number">CLUE {i+1}</span>{c}</div>))}</div>
        <div className="guess-area">
          <input className="guess-input" value={guess} onChange={e=>setGuess(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitGuess()} placeholder="Type player name..." autoFocus/>
          <button className="btn btn-primary" onClick={submitGuess}>Guess</button>
          {clueIndex < totalClues && <button className="btn btn-ghost" onClick={getNextClue}>+Clue</button>}
        </div>
      </div>)}
      {phase === "result" && (<div className="game-card" style={{maxWidth:"640px",margin:"0 auto"}}>
        <div className={"result-banner"+(result?.correct?" correct":" wrong")}>
          <span className="result-emoji">{result?.correct?"\uD83C\uDF89":"\uD83D\uDE14"}</span>
          <div className="result-title">{result?.correct?"Correct!":"Not quite!"}</div>
          <div className="result-answer">The answer was <strong>{result?.answer}</strong></div>
          {result?.correct && <div className="result-score">+{result.score} pts</div>}
          {alreadyPlayed && <div style={{color:"var(--muted)",fontSize:"0.85rem",marginTop:"8px"}}>You already played today. Come back tomorrow!</div>}
        </div>
        <div className="daily-clues-recap"><div className="daily-recap-title">Today's clues</div>
          {clues.map((c,i)=>(<div key={i} className="clue-item"><span className="clue-number">CLUE {i+1}</span>{c}</div>))}
        </div>
        <div style={{padding:"16px 24px",display:"flex",gap:"10px",flexWrap:"wrap"}}>
          <button className="btn btn-primary" onClick={shareResult}>\uD83D\uDCE4 Share Result</button>
          {result?.correct && !saved && (<div style={{display:"flex",gap:"8px",flex:1}}>
            <input className="guess-input" value={playerName} onChange={e=>setPlayerName(e.target.value)} placeholder="Your name for leaderboard..."/>
            <button className="btn btn-gold" onClick={saveScore}>Save</button>
          </div>)}
        </div>
        {showLB && leaderboard.length > 0 && (<div style={{padding:"0 24px 24px"}}>
          <div className="daily-recap-title">Today's Leaderboard</div>
          {leaderboard.map((e,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--border)",fontSize:"0.9rem"}}><span>{i+1}. {e.name}</span><span style={{color:"var(--teal)"}}>{e.score} pts</span></div>))}
        </div>)}
      </div>)}
    </div>
  );
}
