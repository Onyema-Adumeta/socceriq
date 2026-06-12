import { useState, useEffect } from "react";

const ACHIEVEMENTS = [
  { id:"first_blood",   icon:"⚽", title:"First Blood",        desc:"Get your first correct guess",                condition:s=>s.totalWins>=1 },
  { id:"hat_trick",     icon:"🎩", title:"Hat Trick",          desc:"Win 3 games in a row",                        condition:s=>s.streak>=3 },
  { id:"on_fire",       icon:"🔥", title:"On Fire",            desc:"Win 5 games in a row",                        condition:s=>s.streak>=5 },
  { id:"world_class",   icon:"⭐", title:"World Class",        desc:"Win 10 games in a row",                       condition:s=>s.streak>=10 },
  { id:"sharpshooter",  icon:"🎯", title:"Sharpshooter",       desc:"Guess correctly using only 1 clue",           condition:s=>s.oneClueWins>=1 },
  { id:"sniper",        icon:"💎", title:"Sniper",             desc:"Guess with 1 clue 5 times",                   condition:s=>s.oneClueWins>=5 },
  { id:"speed_demon",   icon:"⚡", title:"Speed Demon",        desc:"Guess correctly in under 10 seconds",         condition:s=>s.speedWins>=1 },
  { id:"hard_mode",     icon:"💪", title:"Hard Mode Hero",     desc:"Win a game on Hard difficulty",               condition:s=>s.hardWins>=1 },
  { id:"hard_master",   icon:"👑", title:"Hard Master",        desc:"Win 10 games on Hard difficulty",             condition:s=>s.hardWins>=10 },
  { id:"daily_player",  icon:"⚽", title:"Daily Player",       desc:"Complete the Daily Challenge",                condition:s=>s.dailyCompleted>=1 },
  { id:"daily_streak",  icon:"🔥", title:"Daily Devotee",      desc:"Complete Daily Challenge 7 days in a row",    condition:s=>s.dailyStreak>=7 },
  { id:"legend",        icon:"🏆", title:"Legend",             desc:"Win 50 games total",                          condition:s=>s.totalWins>=50 },
  { id:"veteran",       icon:"🎖", title:"Veteran",            desc:"Play 100 games",                              condition:s=>s.totalGames>=100 },
  { id:"big_brain",     icon:"💡", title:"Big Brain",          desc:"Win early (not all clues) 10 times",          condition:s=>s.earlyWins>=10 },
  { id:"perfectionist", icon:"✨", title:"Perfectionist",      desc:"Win with 1 guess remaining 5 times",          condition:s=>s.lastGuessWins>=5 },
  { id:"african",       icon:"🌍", title:"African Expert",     desc:"Correctly guess 5 African players",           condition:s=>s.africanWins>=5 },
  { id:"south_am",      icon:"🌎", title:"South American Star",desc:"Correctly guess 5 South American players",    condition:s=>s.southAmericanWins>=5 },
  { id:"euro",          icon:"🏟", title:"Euro Expert",        desc:"Correctly guess 10 European players",         condition:s=>s.europeanWins>=10 },
  { id:"explorer",      icon:"🗺", title:"Explorer",           desc:"Guess players from 5 different nationalities",condition:s=>(s.nationalities?.size||0)>=5 },
  { id:"collector",     icon:"📚", title:"Collector",          desc:"Guess 20 different players",                  condition:s=>(s.uniquePlayers?.size||0)>=20 }
];

const AFRICAN = ["Egyptian","Nigerian","Senegalese","Ghanaian","Ivorian","Cameroonian","Algerian","Moroccan","Guinean","Gabonese","Togolese"];
const SOUTH_AM = ["Argentine","Brazilian","Uruguayan","Colombian","Chilean","Peruvian","Venezuelan"];
const EUROPEAN = ["French","Spanish","German","Italian","Portuguese","English","Dutch","Belgian","Croatian","Norwegian","Swedish","Swiss","Austrian","Danish"];

function getStats() {
  try { return JSON.parse(localStorage.getItem("soccerStats")||"{}"); } catch { return {}; }
}

function saveStats(stats) {
  const s={...stats};
  if(s.nationalities instanceof Set) s.nationalities=[...s.nationalities];
  if(s.uniquePlayers instanceof Set) s.uniquePlayers=[...s.uniquePlayers];
  localStorage.setItem("soccerStats",JSON.stringify(s));
}

function loadStats() {
  const r=getStats();
  return {
    totalWins:r.totalWins||0, totalGames:r.totalGames||0,
    streak:r.streak||0, bestStreak:r.bestStreak||0,
    oneClueWins:r.oneClueWins||0, speedWins:r.speedWins||0,
    hardWins:r.hardWins||0, earlyWins:r.earlyWins||0,
    lastGuessWins:r.lastGuessWins||0, africanWins:r.africanWins||0,
    southAmericanWins:r.southAmericanWins||0, europeanWins:r.europeanWins||0,
    dailyCompleted:r.dailyCompleted||0, dailyStreak:r.dailyStreak||0,
    nationalities:new Set(r.nationalities||[]),
    uniquePlayers:new Set(r.uniquePlayers||[]),
    unlockedAchievements:r.unlockedAchievements||[]
  };
}

export function updateStats(result) {
  const stats=loadStats();
  stats.totalGames++;
  if(result.correct) {
    stats.totalWins++; stats.streak++;
    stats.bestStreak=Math.max(stats.bestStreak,stats.streak);
    if(result.cluesUsed===1) stats.oneClueWins++;
    if(result.timeUsed<10) stats.speedWins++;
    if(result.difficulty==="hard") stats.hardWins++;
    if(result.cluesUsed<result.maxClues) stats.earlyWins++;
    if(result.guessesLeft===1) stats.lastGuessWins++;
    if(result.playerNationality) {
      if(AFRICAN.includes(result.playerNationality)) stats.africanWins++;
      if(SOUTH_AM.includes(result.playerNationality)) stats.southAmericanWins++;
      if(EUROPEAN.includes(result.playerNationality)) stats.europeanWins++;
      stats.nationalities.add(result.playerNationality);
    }
    if(result.playerName) stats.uniquePlayers.add(result.playerName);
  } else { stats.streak=0; }
  const newUnlocked=[];
  ACHIEVEMENTS.forEach(a => {
    if(!stats.unlockedAchievements.includes(a.id)&&a.condition(stats)) {
      stats.unlockedAchievements.push(a.id);
      newUnlocked.push(a);
    }
  });
  saveStats(stats);
  return {stats,newUnlocked};
}

export default function AchievementsPage() {
  const [stats,setStats] = useState(loadStats());
  const [filter,setFilter] = useState("all");
  useEffect(()=>{ setStats(loadStats()); },[]);

  const unlocked = stats.unlockedAchievements||[];
  const pct = Math.round(unlocked.length/ACHIEVEMENTS.length*100);
  const filtered = ACHIEVEMENTS.filter(a =>
    filter==="all" ? true : filter==="unlocked" ? unlocked.includes(a.id) : !unlocked.includes(a.id)
  );

  const STAT_ITEMS = [
    {val:stats.totalWins,    label:"Total Wins"},
    {val:stats.totalGames,   label:"Games Played"},
    {val:stats.streak,       label:"Current Streak"},
    {val:stats.bestStreak,   label:"Best Streak"},
    {val:stats.hardWins,     label:"Hard Wins"},
    {val:stats.oneClueWins,  label:"One Clue Wins"},
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Achievements</h1>
        <p>{unlocked.length} / {ACHIEVEMENTS.length} unlocked</p>
      </div>

      <div className="ach-progress-row">
        <div className="prog-bar-outer">
          <div className="prog-bar-inner" style={{width:pct+"%"}}/>
        </div>
        <span className="prog-label">{pct}% complete</span>
      </div>

      <div className="achievements-stats">
        {STAT_ITEMS.map((s,i)=>(
          <div className="ach-stat" key={i}>
            <strong>{s.val}</strong>
            <small>{s.label}</small>
          </div>
        ))}
      </div>

      <div className="filter-pills" style={{marginBottom:24}}>
        {["all","unlocked","locked"].map(f=>(
          <button key={f} className={"filter-pill"+(filter===f?" filter-pill--active":"")} onClick={()=>setFilter(f)}>
            {f==="all"?"All" : f==="unlocked"?"✓ Unlocked":"🔒 Locked"}
          </button>
        ))}
      </div>

      <div className="achievements-grid">
        {filtered.map(a => {
          const isUnlocked = unlocked.includes(a.id);
          return (
            <div key={a.id} className={"achievement-card"+(isUnlocked?" achievement-card--unlocked":" achievement-card--locked")}>
              <div className="ach-icon">{isUnlocked ? a.icon : "🔒"}</div>
              <div className="ach-info">
                <div className="ach-title">{a.title}</div>
                <div className="ach-desc">{a.desc}</div>
              </div>
              {isUnlocked && <div className="ach-badge">✓</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}