import { useState, useEffect } from "react";
import { leaderboardAPI } from "../api";
export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  useEffect(() => {
    leaderboardAPI.get().then(d => { setLeaderboard(d.leaderboard || []); setLoading(false); }).catch(() => { setLeaderboard([]); setLoading(false); });
  }, []);
  const filtered = filter === "all" ? leaderboard : leaderboard.filter(e => e.difficulty === filter);
  const getInitials = name => name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) : "?";
  const avatarColors = ["#00c6ff","#f0b429","#00e676","#ff3d57","#a78bfa","#fb923c"];
  const getColor = name => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];
  const medals = [
    { bg: "linear-gradient(135deg,#ffd700,#b8860b)", text: "#000", label: "1st", icon: "\uD83E\uDD47" },
    { bg: "linear-gradient(135deg,#c0c0c0,#808080)", text: "#000", label: "2nd", icon: "\uD83E\uDD48" },
    { bg: "linear-gradient(135deg,#cd7f32,#8b4513)", text: "#fff", label: "3rd", icon: "\uD83E\uDD49" },
  ];
  return (
    <div className="leaderboard-page">
      <div className="lb-hero">
        <div className="lb-hero-title">Leaderboard</div>
        <div className="lb-hero-sub">Top scores from Soccer Who Am I</div>
        <div className="lb-filters">
          {["all","easy","medium","hard"].map(f => (
            <button key={f} className={"lb-filter-btn" + (filter===f?" active":"")} onClick={()=>setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="lb-loading"><div className="lb-spinner"/><span>Loading scores...</span></div>
      ) : filtered.length === 0 ? (
        <div className="lb-empty">
          <div className="lb-empty-icon">🏆</div>
          <h3>No scores yet!</h3>
          <p>Play the game and be the first on the leaderboard.</p>
        </div>
      ) : (
        <div className="lb-list">
          {filtered.slice(0,3).length > 0 && (
            <div className="lb-podium">
              {[filtered[1], filtered[0], filtered[2]].map((e,pi) => e && (
                <div key={pi} className={"lb-podium-slot lb-podium-slot--" + (pi===0?"silver":pi===1?"gold":"bronze")}>
                  <div className="lb-podium-avatar" style={{background:getColor(e.name)}}>{getInitials(e.name)}</div>
                  <div className="lb-podium-name">{e.name}</div>
                  <div className="lb-podium-score">{(e.score||0).toLocaleString()}</div>
                  <div className="lb-podium-base" style={{background: pi===0?medals[1].bg:pi===1?medals[0].bg:medals[2].bg}}>{pi===0?"2nd":pi===1?"1st":"3rd"}</div>
                </div>
              ))}
            </div>
          )}
          <div className="lb-table-wrap">
            {filtered.map((entry, i) => (
              <div key={i} className={"lb-row2" + (i<3?" lb-row2--top":"")} style={{"--anim-delay": i*0.05+"s"}}>
                <div className="lb-row2-rank">
                  {i < 3 ? <span className="lb-medal" style={{background:medals[i].bg,color:medals[i].text}}>{medals[i].label}</span> : <span className="lb-rank-num">#{i+1}</span>}
                </div>
                <div className="lb-row2-avatar" style={{background:getColor(entry.name)}}>{getInitials(entry.name)}</div>
                <div className="lb-row2-info">
                  <div className="lb-row2-name">{entry.name}</div>
                  <div className="lb-row2-player">{entry.playerName || "Unknown player"}</div>
                </div>
                <div className={"lb-row2-diff lb-diff--"+(entry.difficulty||"easy")}>{entry.difficulty||"easy"}</div>
                <div className="lb-row2-score">{(entry.score||0).toLocaleString()}<span className="lb-pts">pts</span></div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="scoring-guide">
        <h3>How Scoring Works</h3>
        <div className="score-rules">
          <div className="score-rule"><span class="score-rule-icon">⚡</span>Base score: 500 points</div>
          <div className="score-rule"><span class="score-rule-icon">💡</span>Fewer clues needed: Up to +600 bonus</div>
          <div className="score-rule"><span class="score-rule-icon">🎯</span>Fewer guesses used: Up to +250 bonus</div>
          <div className="score-rule"><span class="score-rule-icon">⏱</span>Speed bonus: Up to +300 bonus</div>
        </div>
      </div>
    </div>
  );
}
