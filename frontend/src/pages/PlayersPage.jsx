import { useState, useEffect } from "react";
import { playersAPI } from "../api";

const POSITION_COLORS = {
  "Forward":{ bg:"rgba(0,230,118,0.15)", color:"#00e676", label:"FWD" },
  "Striker":{ bg:"rgba(0,230,118,0.15)", color:"#00e676", label:"ST" },
  "Midfielder":{ bg:"rgba(0,188,212,0.15)", color:"#00bcd4", label:"MID" },
  "Attacking Midfielder":{ bg:"rgba(0,188,212,0.15)", color:"#00bcd4", label:"AM" },
  "Defender":{ bg:"rgba(255,183,77,0.15)", color:"#ffb74d", label:"DEF" },
  "Right Back":{ bg:"rgba(255,183,77,0.15)", color:"#ffb74d", label:"RB" },
  "Left Back":{ bg:"rgba(255,183,77,0.15)", color:"#ffb74d", label:"LB" },
  "Goalkeeper":{ bg:"rgba(239,83,80,0.15)", color:"#ef5350", label:"GK" }
};

const API = "http://localhost:3001";

function getInitials(name) {
  return name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();
}

function getAvatarColor(name) {
  const colors = ["#00e676","#00bcd4","#ffd600","#ff7043","#ab47bc","#26c6da","#66bb6a","#ef5350"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function PlayerAvatar({ player, size = "card" }) {
  const [imgError, setImgError] = useState(false);
  const photo = player.photo
    ? (player.photo.startsWith("/photos/")
      ? API + player.photo
      : API + "/api/photo?url=" + encodeURIComponent(player.photo))
    : null;
  const posStyle = POSITION_COLORS[player.position] || { bg:"rgba(255,255,255,0.1)", color:"#fff", label:"PLY" };
  const avatarColor = getAvatarColor(player.name);
  const isCard = size === "card";

  return (
    <div className={isCard ? "pcv2-photo-wrap" : "pdv2-photo-wrap"}>
      {photo && !imgError ? (
        <img
          src={photo}
          alt={player.name}
          className={isCard ? "pcv2-photo" : "pdv2-photo"}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={isCard ? "pcv2-photo-placeholder" : "pdv2-placeholder"}
          style={{ background: "linear-gradient(135deg, " + avatarColor + "22, " + avatarColor + "44)", border: "2px solid " + avatarColor + "44" }}
        >
          <span style={{ color: avatarColor, fontSize: isCard ? "1.4rem" : "3rem", fontWeight: 800 }}>
            {getInitials(player.name)}
          </span>
        </div>
      )}
      <div className={isCard ? "pcv2-pos" : "pdv2-pos-badge"} style={{background:posStyle.bg,color:posStyle.color}}>
        {isCard ? posStyle.label : player.position}
      </div>
    </div>
  );
}

function PlayerCard({ player, onClick }) {
  return (
    <div className="pcv2" onClick={() => onClick(player)}>
      <PlayerAvatar player={player} size="card" />
      <div className="pcv2-info">
        <div className="pcv2-name">{player.name}</div>
        <div className="pcv2-country">{player.nationality}</div>
        <div className="pcv2-club">{player.currentClub}</div>
        <div className="pcv2-stats">
          <div className="pcv2-stat"><strong>{player.stats?.goals || 0}</strong><small>G</small></div>
          <div className="pcv2-stat"><strong>{player.stats?.assists || 0}</strong><small>A</small></div>
          <div className="pcv2-stat"><strong>{player.stats?.appearances || 0}</strong><small>Apps</small></div>
        </div>
        <span className={"diff-tag diff-tag--"+player.difficulty}>{player.difficulty}</span>
      </div>
    </div>
  );
}

function PlayerDetail({ player, onBack }) {
  const posStyle = POSITION_COLORS[player.position] || { bg:"rgba(255,255,255,0.1)", color:"#fff", label:player.position };
  return (
    <div className="pdv2">
      <button className="btn-back" onClick={onBack}>Back to Players</button>
      <div className="pdv2-card">
        <div className="pdv2-left">
          <PlayerAvatar player={player} size="detail" />
          <div className="pdv2-number">#{player.number || "N/A"}</div>
          <div className="pdv2-stats-col">
            <div className="pdv2-stat"><strong>{player.stats?.goals || 0}</strong><small>Goals</small></div>
            <div className="pdv2-stat"><strong>{player.stats?.assists || 0}</strong><small>Assists</small></div>
            <div className="pdv2-stat"><strong>{player.stats?.appearances || 0}</strong><small>Apps</small></div>
          </div>
        </div>
        <div className="pdv2-right">
          <h2 className="pdv2-name">{player.name}</h2>
          <div className="pdv2-attrs">
            <div className="pdv2-attr"><span className="pdv2-label">Country</span><span className="pdv2-val">{player.nationality}</span></div>
            <div className="pdv2-attr"><span className="pdv2-label">Position</span><span className="pdv2-val">{player.position}</span></div>
            <div className="pdv2-attr"><span className="pdv2-label">Age</span><span className="pdv2-val">{player.age || "N/A"}</span></div>
            <div className="pdv2-attr"><span className="pdv2-label">Height</span><span className="pdv2-val">{player.height || "N/A"}</span></div>
            <div className="pdv2-attr"><span className="pdv2-label">Current Club</span><span className="pdv2-val">{player.currentClub}</span></div>
            <div className="pdv2-attr"><span className="pdv2-label">League</span><span className="pdv2-val">{player.league || "N/A"}</span></div>
            <div className="pdv2-attr"><span className="pdv2-label">Former Clubs</span><span className="pdv2-val">{player.formerClubs?.slice(0,3).join(", ") || "N/A"}</span></div>
          </div>
          <div className="pdv2-trophies">
            <h4>Major Trophies</h4>
            <div className="trophy-grid">
              {player.trophies?.length > 0
                ? player.trophies.map((t,i) => <span key={i} className="trophy-tag">{t}</span>)
                : <span style={{color:"var(--text3)"}}>No trophies listed</span>
              }
            </div>
          </div>
          {player.famousMoments?.length > 0 && (
            <div className="pdv2-moments">
              <h4>Famous Moments</h4>
              {player.famousMoments.map((m,i) => <div key={i} className="moment-item">- {m}</div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [position, setPosition] = useState("all");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    playersAPI.getAll().then(d => {
      setPlayers(d.players);
      setFiltered(d.players);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = players;
    if (search) result = result.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.nationality||"").toLowerCase().includes(search.toLowerCase()) ||
      (p.currentClub||"").toLowerCase().includes(search.toLowerCase())
    );
    if (difficulty !== "all") result = result.filter(p => p.difficulty === difficulty);
    if (position !== "all") result = result.filter(p => (p.position||"").toLowerCase().includes(position.toLowerCase()));
    setFiltered(result);
  }, [search, difficulty, position, players]);

  if (loading) return <div className="page-loading">Loading players...</div>;
  if (selected) return <PlayerDetail player={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="players-page">
      <div className="page-header">
        <h1>Player Encyclopedia</h1>
        <p>{players.length} soccer legends - click any player for full profile</p>
      </div>
      <div className="players-filters">
        <input
          className="search-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, nationality or club..."
        />
        <div style={{display:"flex",gap:"16px",flexWrap:"wrap",marginTop:"8px"}}>
          <div>
            <div style={{fontSize:"0.75rem",color:"var(--text3)",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.08em"}}>Difficulty</div>
            <div className="filter-pills">
              {["all","easy","medium","hard"].map(d => (
                <button key={d} className={"filter-pill"+(difficulty===d?" filter-pill--active":"")} onClick={() => setDifficulty(d)}>{d}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:"0.75rem",color:"var(--text3)",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.08em"}}>Position</div>
            <div className="filter-pills">
              {["all","forward","striker","midfielder","defender","goalkeeper"].map(p => (
                <button key={p} className={"filter-pill"+(position===p?" filter-pill--active":"")} onClick={() => setPosition(p)}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="players-count">{filtered.length} players found</div>
      <div className="pcv2-grid">
        {filtered.map(p => <PlayerCard key={p.id} player={p} onClick={setSelected} />)}
      </div>
    </div>
  );
}