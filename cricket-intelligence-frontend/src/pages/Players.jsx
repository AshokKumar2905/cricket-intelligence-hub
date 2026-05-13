import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useToast } from "../context/ToastContext";
import { CardSkeleton } from "../components/Skeleton";

const ROLES = ["Batters", "Bowler", "All Rounder", "Wicket Keeper"];
const API_BASE = "http://127.0.0.1:5000"; 

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [uploading, setUploading] = useState({});

  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filterRole) params.append("role", filterRole);
      
      const res = await api.get(`/players?${params.toString()}`);
      setPlayers(res.data.data || []);
    } catch (err) {
      addToast("System Sync Failure: Player rosters offline", "error");
    } finally {
      setLoading(false);
    }
  }, [search, filterRole, addToast]);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  const addPlayer = async () => {
    if (!name || !role) { 
      addToast("Intelligence Check: Name and Designation required", "error"); 
      return; 
    }
    try {
      const res = await api.post("/players", { name, role });
      setPlayers((prev) => [...prev, res.data.data]);
      setName(""); setRole("");
      addToast(`${name.toUpperCase()} registered to tactical roster.`);
    } catch (err) { 
      addToast("Registration protocol error", "error"); 
    }
  };

  const deletePlayer = async (id, playerName) => {
    if (!id || id === "undefined") {
      addToast("ID synchronization pending. Refresh system.", "error");
      return;
    }
    if (!window.confirm(`PERMANENT_ACTION: Purge ${playerName.toUpperCase()}?`)) return;
    try {
      await api.delete(`/players/${id}`);
      setPlayers((prev) => prev.filter((p) => (p.id || p._id) !== id));
      addToast(`${playerName.toUpperCase()} node decommissioned.`);
    } catch (err) { 
      addToast("Purge sequence failure", "error"); 
    }
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/players/${id}`, { name: editName, role: editRole });
      setPlayers((prev) => prev.map((p) => ((p.id || p._id) === id ? { ...p, name: editName, role: editRole } : p)));
      setEditingId(null);
      addToast("Athlete profile updated.");
    } catch (err) { 
      addToast("Data update failure", "error"); 
    }
  };

  const handlePhotoUpload = async (playerId, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [playerId]: true }));
    try {
      const form = new FormData();
      form.append("photo", file);
      const res = await api.post(`/players/${playerId}/photo`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setPlayers((prev) => prev.map((p) => (p.id || p._id) === playerId ? { ...p, photo: res.data.data.photo } : p));
      addToast("Bio-metric asset uplink successful.");
    } catch (err) { 
      addToast("Asset sync failure", "error"); 
    } finally { 
      setUploading((prev) => ({ ...prev, [playerId]: false })); 
    }
  };

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "" || p.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="page-fade-in" style={iccPage}>
      <div style={iccHeaderSection}>
        <div style={iccHeaderContent}>
          <span style={iccTag}>OFFICIAL_ROSTER_STREAM</span>
          <h1 style={iccTitle}>ATHLETE_INTEL</h1>
          <p style={iccSubtitle}>Managing operational identities and bio-metric assets.</p>
        </div>
      </div>

      {/* TACTICAL CONTROL PANEL */}
      <div className="glass-card" style={adminDrawer}>
        <div style={formRow}>
          <input 
            placeholder="INPUT_ATHLETE_NAME" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            style={iccInp} 
          />
          <select value={role} onChange={e => setRole(e.target.value)} style={iccInp}>
            <option value="">SELECT_DESIGNATION</option>
            {ROLES.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
          </select>
          <button onClick={addPlayer} style={iccActionBtn}>COMMIT +</button>
        </div>
        
        <div style={{ ...formRow, marginTop: '15px', opacity: 0.8 }}>
          <input 
            placeholder="QUERY_ROSTER..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ ...iccInp, flex: 2 }} 
          />
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={iccInp}>
            <option value="">ALL_DESIGNATIONS</option>
            {ROLES.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      {/* RESPONSIVE INTEL GRID */}
      <div style={iccGrid}>
        {loading ? (
          <CardSkeleton count={4} />
        ) : filteredPlayers.length === 0 ? (
          <div className="glass-card" style={emptyState}>NO_ATHLETE_NODES_IDENTIFIED.</div>
        ) : (
          filteredPlayers.map((p) => {
            const pid = p.id || p._id;
            const playerSlug = encodeURIComponent(p.name).replace(/\//g, "%2F");
            return (
              <div key={pid} className="glass-card" style={iccCard}>
                <div style={imageContainer}>
                  {p.photo ? (
                    <img src={`${API_BASE}${p.photo}`} alt={p.name} style={iccImage} />
                  ) : (
                    <div style={iccFallback}>{p.name?.[0]}</div>
                  )}
                  <div style={imageOverlay}>
                     <label style={uploadIcon}>
                       {uploading[pid] ? "..." : "📸"}
                       <input type="file" style={{display: 'none'}} onChange={e => handlePhotoUpload(pid, e.target.files[0])} />
                     </label>
                  </div>
                </div>

                <div style={cardContent}>
                  <span style={roleLabel}>{(p.role || "Athlete").toUpperCase()}</span>
                  
                  {editingId === pid ? (
                    <div style={editStack}>
                      <input value={editName} onChange={e => setEditName(e.target.value)} style={miniInp} />
                      <div style={{display: 'flex', gap: '5px'}}>
                         <button onClick={() => saveEdit(pid)} style={miniBtn}>SAVE</button>
                         <button onClick={() => setEditingId(null)} style={miniBtnCancel}>X</button>
                      </div>
                    </div>
                  ) : (
                    <h3 style={playerNameText} onClick={() => navigate(`/players/${playerSlug}`)}>
                      {p.name.toUpperCase()}
                    </h3>
                  )}
                  
                  <div style={iccBtnGroup}>
                    <button onClick={() => {setEditingId(pid); setEditName(p.name); setEditRole(p.role)}} style={utilBtn}>EDIT</button>
                    <button onClick={() => deletePlayer(pid, p.name)} style={utilBtnRed}>PURGE</button>
                  </div>
                  
                  <button 
                    style={viewIntelBtn} 
                    onClick={() => navigate(`/players/${playerSlug}`)}
                  >
                    ACCESS_DEEP_INTEL →
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ================= TACTICAL STYLES ================= */
const iccPage = { minHeight: "100vh", color: 'white' };
const iccHeaderSection = { padding: "60px 8% 40px" };
const iccHeaderContent = { maxWidth: "1400px", margin: "0 auto" };
const iccTag = { color: "#00f2ff", fontWeight: "900", fontSize: "11px", letterSpacing: "5px" };
const iccTitle = { fontSize: "clamp(32px, 5vw, 48px)", fontWeight: "900", margin: "10px 0", letterSpacing: "-1px" };
const iccSubtitle = { color: "#94a3b8", fontSize: "15px", opacity: 0.8 };

const adminDrawer = { margin: "0 8%", padding: "25px", borderBottom: "1px solid rgba(255,255,255,0.05)" };
const formRow = { display: "flex", gap: "15px", flexWrap: 'wrap' };
const iccInp = { flex: 1, minWidth: '220px' };
const iccActionBtn = { background: "#00f2ff", color: "#000000", border: "none", padding: "0 35px", fontWeight: "900", cursor: "pointer", borderRadius: '2px', boxShadow: '0 0 15px rgba(0,242,255,0.3)' };

const iccGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "30px", padding: "50px 8%" };
const iccCard = { overflow: "hidden", border: '1px solid rgba(255,255,255,0.05)' };
const imageContainer = { position: "relative", height: "300px", background: "rgba(0,0,0,0.4)" };
const iccImage = { width: "100%", height: "100%", objectFit: "cover" };
const iccFallback = { height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "80px", color: "rgba(0,242,255,0.1)", fontWeight: '900' };
const imageOverlay = { position: "absolute", top: "15px", right: "15px" };
const uploadIcon = { background: "rgba(0,0,0,0.7)", padding: "10px", borderRadius: "2px", cursor: "pointer", backdropFilter: 'blur(5px)', border: '1px solid rgba(0,242,255,0.2)' };

const cardContent = { padding: "25px" };
const roleLabel = { color: "#38bdf8", fontSize: "10px", fontWeight: "900", letterSpacing: "2px" };
const playerNameText = { fontSize: "20px", fontWeight: "900", margin: "10px 0 20px", cursor: "pointer", color: 'white', letterSpacing: '-0.5px' };
const viewIntelBtn = { width: '100%', marginTop: '20px', background: 'rgba(0, 242, 255, 0.08)', color: '#00f2ff', border: '1px solid rgba(0, 242, 255, 0.2)', padding: '12px', fontWeight: '900', cursor: 'pointer', borderRadius: '2px' };
const iccBtnGroup = { display: "flex", gap: "10px" };
const utilBtn = { flex: 1, background: "rgba(255,255,255,0.03)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", padding: '8px', fontSize: '9px', fontWeight: '800', cursor: 'pointer' };
const utilBtnRed = { flex: 1, background: "rgba(255, 0, 85, 0.05)", color: "#ff0055", border: "1px solid rgba(255, 0, 85, 0.2)", padding: '8px', fontSize: '9px', fontWeight: '800', cursor: 'pointer' };

const editStack = { display: "flex", flexDirection: 'column', gap: "10px", marginBottom: "20px" };
const miniInp = { width: "100%", fontSize: '12px', background: '#000' };
const miniBtn = { flex: 1, background: "#00f2ff", color: "#000", border: "none", padding: "8px", fontWeight: '900', borderRadius: '2px' };
const miniBtnCancel = { flex: 1, background: "#1e293b", color: "#94a3b8", border: "none", padding: "8px", borderRadius: '2px' };
const emptyState = { gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#475569', fontSize: '12px', fontWeight: '900', letterSpacing: '2px' };