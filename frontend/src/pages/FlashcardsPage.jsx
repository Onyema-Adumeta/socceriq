import { useState, useEffect } from "react";
import { flashcardAPI } from "../api";

function FlashcardView({ card, index, total, onPrev, onNext, onShuffle, onBack, quizMode, setQuizMode }) {
  const [flipped, setFlipped] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizResult, setQuizResult] = useState(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  useEffect(() => { setFlipped(false); setQuizAnswer(""); setQuizResult(null); }, [index]);
  const checkQuiz = () => {
    const answer = card.back.toLowerCase();
    const correct = answer.includes(quizAnswer.toLowerCase().trim()) && quizAnswer.length > 1;
    setQuizResult(correct ? "correct" : "wrong");
    setScore(s => correct ? {...s,correct:s.correct+1} : {...s,wrong:s.wrong+1});
  };
  const pct = Math.round(score.correct / (score.correct + score.wrong || 1) * 100);
  return (
    <div className="flashcards-page">
      <div className="fc-top-bar">
        <button className="btn btn-ghost fc-back-btn" onClick={onBack}>← Back</button>
        <div className="fc-deck-title">{card.deck}</div>
        <div className="fc-card-count">Card {index+1} of {total}</div>
      </div>
      <div className="fc-toolbar">
        <div style={{display:"flex",gap:8}}>
          <button className={"btn "+(quizMode?"btn-primary":"btn-ghost")} onClick={()=>{setQuizMode(m=>!m);setQuizResult(null);setQuizAnswer("");}}>📝 {quizMode?"Quiz On":"Quiz Mode"}</button>
          <button className="btn btn-ghost" onClick={onShuffle}>🔀 Shuffle</button>
        </div>
        {(score.correct+score.wrong)>0 && (<div className="fc-score">
          <span className="fc-score-correct">✅ {score.correct}</span>
          <span className="fc-score-wrong">❌ {score.wrong}</span>
          <span className="fc-score-pct">{pct}%</span>
        </div>)}
      </div>
      <div className={"flashcard-container"+(quizMode?" quiz-mode":"")} onClick={()=>!quizMode&&setFlipped(f=>!f)}>
        <div className={"flashcard"+(flipped?" flipped":"")}>
          <div className="flashcard-front">
            <div className="fc-side-label">{quizMode?"Question":"Front"}</div>
            <div className="fc-text">{card.front}</div>
            {!quizMode && <div className="fc-flip-hint">👆 Tap to flip</div>}
          </div>
          <div className="flashcard-back">
            <div className="fc-side-label">Answer</div>
            <div className="fc-answer">{card.back}</div>
          </div>
        </div>
      </div>
      {quizMode && !quizResult && (
        <div className="fc-quiz-input">
          <input className="guess-input" value={quizAnswer} onChange={e=>setQuizAnswer(e.target.value)} onKeyDown={e=>e.key==="Enter"&&checkQuiz()} placeholder="Type your answer..." autoFocus/>
          <button className="btn btn-primary" onClick={checkQuiz}>Check</button>
        </div>
      )}
      {quizResult && (
        <div className={"fc-quiz-result "+(quizResult==="correct"?"fc-correct":"fc-wrong")}>
          {quizResult==="correct" ? "✅ Correct!" : "❌ Wrong — "+card.back}
          <button className="btn btn-ghost" style={{marginLeft:16}} onClick={()=>{setQuizResult(null);setQuizAnswer("");}}>Try Again</button>
        </div>
      )}
      <div className="fc-nav">
        <button className="btn btn-ghost" onClick={onPrev} disabled={index===0}>← Prev</button>
        <div className="fc-progress-wrap"><div className="fc-progress-bar" style={{width:(index+1)/total*100+"%"}}/></div>
        <button className="btn btn-ghost" onClick={onNext} disabled={index===total-1}>Next →</button>
      </div>
    </div>
  );
}

export default function FlashcardsPage() {
  const [decks, setDecks] = useState([]);
  const [activeDeck, setActiveDeck] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizMode, setQuizMode] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => { flashcardAPI.getDecks().then(d => { setDecks(d.decks||[]); setLoading(false); }).catch(()=>setLoading(false)); }, []);
  const openDeck = deck => { setActiveDeck(deck); setCardIndex(0); setQuizMode(false); };
  const shuffle = () => { setActiveDeck({...activeDeck,cards:[...activeDeck.cards].sort(()=>Math.random()-0.5)}); setCardIndex(0); };
  const DECK_ICONS = {
    "World Cup Legends":"🏆",
    "champions-league":"⭐",
    "Premier League":"⚽",
    "Ballon d Or Winners":"🥇",
    "African Legends":"🌍",
    "Bundesliga Stars":"🇩🇪",
    "Serie A Legends":"🇮🇹",
    "PSG and Ligue 1":"🇫🇷",
    "MLS Stars":"🦅",
    "La Liga Stars":"🇪🇸",
  };
  const DECK_COLORS = ["#00c6ff","#f0b429","#00e676","#ff3d57","#a78bfa","#fb923c","#34d399","#f472b6","#60a5fa","#fbbf24"];
  if (loading) return <div className="page-loading"><div className="lb-spinner"/><span>Loading decks...</span></div>;
  if (activeDeck) return (<FlashcardView card={{...activeDeck.cards[cardIndex],deck:activeDeck.name}} index={cardIndex} total={activeDeck.cards.length} onPrev={()=>setCardIndex(i=>Math.max(i-1,0))} onNext={()=>setCardIndex(i=>Math.min(i+1,activeDeck.cards.length-1))} onShuffle={shuffle} onBack={()=>setActiveDeck(null)} quizMode={quizMode} setQuizMode={setQuizMode}/>);
  const filtered = decks.filter(d => !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.description?.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="page-container">
      <div className="fc-hero">
        <h1 className="fc-hero-title">Flashcard Decks</h1>
        <p className="fc-hero-sub">Study soccer knowledge · Quiz mode to test yourself</p>
        <input className="fc-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search decks..."/>
      </div>
      {filtered.length === 0 ? (
        <div className="lb-empty"><div className="lb-empty-icon">📚</div><h3>No decks found</h3><p>Try a different search term.</p></div>
      ) : (
        <div className="deck-grid">
          {filtered.map((deck,i) => (
            <div key={deck.id||i} className="deck-card" onClick={()=>openDeck(deck)} style={{"--deck-color":DECK_COLORS[i%DECK_COLORS.length]}}>
              <div className="deck-card-top">
                <div className="deck-icon-new">{DECK_ICONS[deck.name]||"📚"}</div>
                <div className="deck-count-badge">{deck.cards?.length||0} cards</div>
              </div>
              <div className="deck-title-new">{deck.name}</div>
              <div className="deck-desc-new">{deck.description}</div>
              <div className="deck-cta">Study Now</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
