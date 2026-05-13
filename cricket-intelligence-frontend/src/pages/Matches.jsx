import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useToast } from "../context/ToastContext";
import { CardSkeleton } from "../components/Skeleton";

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [format, setFormat] = useState("T20");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { addToast } = useToast();
  const navigate = useNavigate();

  /**
   * TACTICAL DATA RETRIEVAL
   * Syncs match fixtures from the containerized database
   */
  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/matches");
      // Logic: Backend might return data wrapped in status/data keys
      setMatches(res.data.data || []);
    } catch (err) {
      addToast("UPLINK_ERROR: Failed to sync match fixtures", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  /**
   * FIXTURE REGISTRATION
   * Commits a new match node to the system
   */
  const addMatch = async () => {
    if (!team1 || !team2 || !date || !venue) {
      addToast("CRITICAL_ERROR: Missing required match parameters", "error");
      return;
    }
    try {
      await api.post("/matches", { 
        team1, team2, format, venue, date,
        status: "scheduled",
        team1_runs: 0,
        team2_runs: 0
      });
      addToast("INTELLIGENCE_ENTRY_COMMITTED ✅");
      fetchMatches();
      setTeam1(""); setTeam2(""); setDate(""); setVenue("");
    } catch (err) {
      addToast("ENGINE_FAILURE: Registration sequence aborted", "error");
    }
  };

  /**
   * EDIT SEQUENCE INITIATION
   * Clones match data into a temporary state for reconfiguration
   */
  const startEdit = (m) => {
    const mid = m.id || m._id;
    setEditingId(mid);
    setEditForm({ ...m });
  };

  /**
   * UPLINK SYNCHRONIZATION (PUT)
   * Sends reconfigured data back to the engine
   */
  const saveEdit = async (id) => {
    try {
      // Tactical Debug: Ensure the ID is being passed correctly
      console.log(`[Uplink Protocol]: Reconfiguring Node ${id}`);
      
      await api.put(`/matches/${id}`, editForm);
      
      addToast("DATA_NODE_SYNCHRONIZED ✅");
      setEditingId(null);
      fetchMatches();
    } catch (err) {
      console.error("[System Error]:", err);
      addToast("UPLINK_FAILURE: API protocol mismatch", "error");
    }
  };

  /**
   * PURGE SEQUENCE (DELETE)
   * Permanently removes a match node from the intelligence hub
   */
  const deleteMatch = async (id) => {
    if (!window.confirm("CRITICAL_PROTOCOL: Permanently purge this fixture?")) return;
    try {
      await api.delete(`/matches/${id}`);
      addToast("INTEL_RECORD_PURGED 🔥");
      fetchMatches();
    } catch (err) {
      addToast("PURGE_SEQUENCE_FAILED", "error");
    }
  };

  return (
    <div className="page-fade-in" style={iccPage}>
      <div style={iccHeaderSection}>
        <div style={iccHeaderContent}>
          <span style={iccTag}>SYSTEM_FIXTURE_STREAM</span>
          <h1 style={iccTitle}>MATCH_LOGS</h1>
          <p style={iccSubtitle}>Real-time scheduling and match-specific analytics gateways.</p>
        </div>
      </div>

      {/* TACTICAL_CONTROL_DRAWER */}
      <div style={adminDrawer} className="glass-card">
        <h3 style={drawerTitle}>REGISTER_FIXTURE_ENTRY</h3>
        <div style={formRow}>
          <input placeholder="AFFILIATION_A" value={team1} onChange={e => setTeam1(e.target.value)} style={iccInp} />
          <input placeholder="AFFILIATION_B" value={team2} onChange={e => setTeam2(e.target.value)} style={iccInp} />
          <select value={format} onChange={e => setFormat(e.target.value)} style={iccInp}>
            <option value="T20">T20_FORMAT</option>
            <option value="ODI">ODI_FORMAT</option>
            <option value="TEST">TEST_FORMAT</option>
          </select>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={iccInp} />
          <input placeholder="VENUE_IDENTIFIER" value={venue} onChange={e => setVenue(e.target.value)} style={iccInp} />
          <button onClick={addMatch} style={iccActionBtn}>COMMIT +</button>
        </div>
      </div>

      <div style={contentPadding}>
        <div style={matchGrid}>
          {loading ? (
            <CardSkeleton count={4} />
          ) : matches.length === 0 ? (
            <div style={emptyState} className="glass-card">
                <p style={{fontSize: '40px', margin: '0 0 20px 0', color: '#ff0055'}}>⚠️</p>
                <p>NO_INTELLIGENCE_RECORDS_IDENTIFIED.</p>
            </div>
          ) : (
            matches.map((m) => {
              const mid = m.id || m._id;
              return (
                <div key={mid} className="glass-card" style={matchCardStyle}>
                  {editingId === mid ? (
                    <div style={editWrapper}>
                      <label style={editLabel}>RECONFIGURING_DATA_NODE</label>
                      <input style={iccInp} value={editForm.team1} onChange={e => setEditForm({...editForm, team1: e.target.value})} />
                      <input style={iccInp} value={editForm.team2} onChange={e => setEditForm({...editForm, team2: e.target.value})} />
                      <input style={iccInp} value={editForm.venue} onChange={e => setEditForm({...editForm, venue: e.target.value})} />
                      <select style={iccInp} value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                        <option value="scheduled">SCHEDULED</option>
                        <option value="live">LIVE_ANALYSIS</option>
                        <option value="completed">ARCHIVED</option>
                      </select>
                      <div style={btnRow}>
                        <button style={btnSave} onClick={() => saveEdit(mid)}>UPLINK</button>
                        <button style={btnCancel} onClick={() => setEditingId(null)}>ABORT</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={matchHeader}>
                        <span style={formatBadge}>{m.format?.toUpperCase() || 'UNIT'}</span>
                        <span style={m.status === 'live' ? liveText : statusText}>
                          {m.status === 'live' && <span className="live-pulse" style={{marginRight: '8px'}}></span>}
                          {(m.status || 'scheduled').toUpperCase()}
                        </span>
                      </div>
                      <div style={teamsDisplay}>
                        <div style={teamRow}>
                            <span>{m.team1}</span>
                            <span style={{color: '#00f2ff'}}>{m.team1_runs || 0}</span>
                        </div>
                        <div style={teamRow}>
                            <span>{m.team2}</span>
                            <span style={{color: '#00f2ff'}}>{m.team2_runs || 0}</span>
                        </div>
                      </div>
                      
                      <button 
                          style={analyzeBtn}
                          onClick={() => navigate('/dashboard')} 
                      >
                          ACCESS_COMMAND_CENTER
                      </button>

                      <div style={matchFooter}>
                        <div style={metaGroup}>
                          <p style={metaItem}>LOC: {m.venue?.toUpperCase() || 'TBD'}</p>
                          <p style={metaItem}>LOG: {m.date}</p>
                        </div>
                        <div style={btnRow}>
                          <button style={utilBtn} onClick={() => startEdit(m)}>EDIT</button>
                          <button style={utilBtnRed} onClick={() => deleteMatch(mid)}>PURGE</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= TACTICAL STYLES ================= */
const iccPage = { background: "transparent", minHeight: "100vh", paddingBottom: '60px', color: 'white' };
const iccHeaderSection = { background: "rgba(10, 11, 16, 0.95)", padding: "60px 5% 40px", borderBottom: '1px solid rgba(255,255,255,0.05)' };
const iccHeaderContent = { maxWidth: "1200px", margin: "0 auto" };
const iccTag = { color: "#00f2ff", fontWeight: "900", letterSpacing: "5px", fontSize: "10px" };
const iccTitle = { fontSize: "48px", fontWeight: "900", margin: "10px 0", letterSpacing: "-2px" };
const iccSubtitle = { color: "#64748b", fontSize: "14px", fontWeight: '500', opacity: 0.8 };

const adminDrawer = { margin: "0 5%", padding: "30px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: 'rgba(0,0,0,0.4)' };
const drawerTitle = { fontSize: "10px", fontWeight: "900", marginBottom: "20px", textTransform: "uppercase", letterSpacing: '2px', color: '#00f2ff' };
const formRow = { display: "flex", gap: "15px", flexWrap: "wrap" };
const iccInp = { background: "#000", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "14px", borderRadius: "2px", fontSize: "12px", outline: "none", flex: 1, minWidth: '160px' };
const iccActionBtn = { background: "#00f2ff", color: "#000", border: "none", padding: "0 35px", fontWeight: "900", cursor: "pointer", letterSpacing: '2px', borderRadius: '2px' };

const contentPadding = { padding: "50px 5%" };
const matchGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "25px" };
const matchCardStyle = { background: "rgba(16, 18, 27, 0.7)", border: "1px solid rgba(255,255,255,0.05)", padding: "30px", borderTop: "4px solid #00f2ff", borderRadius: '2px' };
const matchHeader = { display: "flex", justifyContent: "space-between", marginBottom: "25px", alignItems: "center" };
const formatBadge = { color: "#64748b", fontWeight: "900", fontSize: "10px", letterSpacing: "2px" };
const statusText = { color: "#64748b", fontSize: "10px", fontWeight: "800", letterSpacing: '1px' };
const liveText = { color: "#ff0055", fontSize: "10px", fontWeight: "900", display: "flex", alignItems: "center", letterSpacing: '1px' };
const teamsDisplay = { display: "flex", flexDirection: "column", gap: "15px", marginBottom: "25px" };
const teamRow = { display: "flex", justifyContent: "space-between", color: "white", fontSize: "18px", fontWeight: "900", letterSpacing: '-0.5px' };

const analyzeBtn = { width: '100%', padding: '14px', background: 'rgba(0, 242, 255, 0.08)', color: '#00f2ff', border: '1px solid rgba(0, 242, 255, 0.2)', fontWeight: '900', fontSize: '10px', cursor: 'pointer', marginBottom: '20px', letterSpacing: '2px', borderRadius: '2px' };

const matchFooter = { display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px" };
const metaGroup = { display: "flex", flexDirection: "column", gap: "6px" };
const metaItem = { color: "#64748b", fontSize: "10px", fontWeight: "800", margin: 0, letterSpacing: '1px' };
const btnRow = { display: "flex", gap: "10px" };
const utilBtn = { background: "rgba(255,255,255,0.03)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 15px", fontSize: "9px", fontWeight: "900", cursor: "pointer", borderRadius: '2px' };
const utilBtnRed = { background: "rgba(255, 0, 85, 0.05)", color: "#ff0055", border: "1px solid rgba(255, 0, 85, 0.2)", padding: "8px 15px", fontSize: "9px", fontWeight: "900", cursor: "pointer", borderRadius: '2px' };

const editWrapper = { display: "flex", flexDirection: "column", gap: "12px" };
const editLabel = { fontSize: "9px", color: "#00f2ff", fontWeight: "900", letterSpacing: '2px', marginBottom: '5px' };
const btnSave = { background: "#00f2ff", color: "#000", border: "none", padding: "12px", fontWeight: "900", borderRadius: "2px", cursor: "pointer", fontSize: '10px', letterSpacing: '2px' };
const btnCancel = { background: "#1e293b", color: "#94a3b8", border: "none", padding: "12px", fontWeight: "900", borderRadius: "2px", cursor: "pointer", fontSize: '10px' };
const emptyState = { gridColumn: "1 / -1", padding: "120px 40px", textAlign: "center", color: "#64748b", fontSize: '12px', fontWeight: '900', letterSpacing: '2px' };