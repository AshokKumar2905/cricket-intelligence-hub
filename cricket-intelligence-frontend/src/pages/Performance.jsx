import React, { useEffect, useState, useMemo } from "react";
import api from "../api";
import { useToast } from "../context/ToastContext";

export default function Performance() {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedMatchTeams, setSelectedMatchTeams] = useState([]);
  const { addToast } = useToast();

  const [form, setForm] = useState({
    player_id: "",
    match_id: "",
    team: "",
    runs: 0,
    balls: 0,
    wickets: 0,
    runs_conceded: 0,
    balls_bowled: 0,
    catches: 0,
    stumpings: 0,
    phase: "Middle", 
    dismissed_by: ""
  });

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [pRes, mRes] = await Promise.all([
                api.get("/players"),
                api.get("/matches")
            ]);
            setPlayers(pRes.data.data || []);
            setMatches(mRes.data.data || []);
        } catch (err) {
            addToast("METADATA_SYNC_FAILURE: Engine offline", "error");
        }
    };
    fetchData();
  }, [addToast]);

  const statsPreview = useMemo(() => {
    const runs = Number(form.runs) || 0;
    const balls = Number(form.balls) || 0;
    const conceded = Number(form.runs_conceded) || 0;
    const bowled = Number(form.balls_bowled) || 0;

    const sr = balls > 0 ? ((runs / balls) * 100).toFixed(2) : "0.00";
    const overs = (bowled / 6);
    const econ = overs > 0 ? (conceded / overs).toFixed(2) : "0.00";
    
    return { sr, econ };
  }, [form]);

  const handleMatchChange = (mid) => {
    const match = matches.find(m => (m.id || m._id) === mid);
    set("match_id", mid);
    if (match) {
      const t1 = match.team1 || match.teamA;
      const t2 = match.team2 || match.teamB;
      setSelectedMatchTeams([t1, t2]);
      set("team", ""); 
    } else {
      setSelectedMatchTeams([]);
    }
  };

  /**
   * TACTICAL COMMIT LOGIC
   * Maps manual UI fields to the Global Intelligence Schema
   */
  const add = async () => {
    if (!form.player_id || !form.match_id || !form.team) {
      addToast("CONTEXT_ERROR: Athlete, Fixture, and Team required", "error");
      return;
    }

    try {
      const selectedPlayer = players.find(p => (p.id || p._id) === form.player_id);
      const opponentTeam = selectedMatchTeams.find(t => t !== form.team);

      // SCHEMA MAPPING: Injects keys required by the Dashboard Aggregator
      const payload = {
        ...form,
        player: selectedPlayer?.name,      // Direct map for Dashboard Leaderboard
        striker: selectedPlayer?.name,     // Direct map for Athlete Intel Radar
        runs: Number(form.runs),           // Normalized Numeric
        balls: Number(form.balls),         // Normalized Numeric
        team: form.team,                   // Active Affiliation
        batting_team: form.team,           // Redundant map for Pandas stability
        bowling_team: opponentTeam || "Unknown",
        over: form.phase === "Powerplay" ? 1 : form.phase === "Middle" ? 10 : 18,
        bowler: form.dismissed_by || "System Node",
        player_dismissed: form.dismissed_by ? selectedPlayer?.name : null
      };

      await api.post("/performance", payload);
      addToast("INTELLIGENCE_SYNC_COMPLETE ✅");
      
      // Post-Commit UI Reset
      setForm(prev => ({
        ...prev,
        runs: 0, balls: 0, wickets: 0, runs_conceded: 0, balls_bowled: 0,
        catches: 0, stumpings: 0, dismissed_by: ""
      }));
    } catch (err) {
      addToast("ENGINE_COMMIT_FAILED", "error");
    }
  };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="page-fade-in" style={iccPageContainer}>
      <div style={iccHeaderSection}>
        <div style={iccHeaderContent}>
          <span style={iccTag}>UNIFIED_DATA_INTAKE</span>
          <h1 style={iccTitle}>PERFORMANCE_INTEL</h1>
          <p style={iccSubtitle}>Feeding multi-dimensional match events into the intelligence engine.</p>
        </div>
        <div style={previewPanel}>
            <div style={previewBox}>
                <span style={previewLabel}>PROJECTED_SR</span>
                <span style={previewValue}>{statsPreview.sr}</span>
            </div>
            <div style={previewBox}>
                <span style={previewLabel}>PROJECTED_ECON</span>
                <span style={previewValue}>{statsPreview.econ}</span>
            </div>
        </div>
      </div>

      <div style={contentWrapper}>
        <div className="glass-card" style={iccMainCard}>
            <div style={formSection}>
                <h3 style={sectionLabel}>MATCH_CONTEXT</h3>
                <div style={fieldGrid}>
                    <Field label="ATHLETE_PROFILE">
                        <select value={form.player_id} onChange={e => set("player_id", e.target.value)} style={iccInp}>
                            <option value="">-- SELECT --</option>
                            {players.map(p => (
                                <option key={p.id || p._id} value={p.id || p._id}>
                                    {p.name.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="FIXTURE_IDENTIFIER">
                        <select value={form.match_id} onChange={e => handleMatchChange(e.target.value)} style={iccInp}>
                            <option value="">-- SELECT --</option>
                            {matches.map(m => (
                                <option key={m.id || m._id} value={m.id || m._id}>
                                    {m.team1 || m.teamA} VS {m.team2 || m.teamB}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="ACTIVE_AFFILIATION">
                        <select value={form.team} onChange={e => set("team", e.target.value)} style={iccInp} disabled={!form.match_id}>
                            <option value="">-- SELECT --</option>
                            {selectedMatchTeams.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </Field>
                    <Field label="OPERATIONAL_PHASE">
                        <select value={form.phase} onChange={e => set("phase", e.target.value)} style={iccInp}>
                            <option value="Powerplay">POWERPLAY (01-06)</option>
                            <option value="Middle">MIDDLE_OVERS (07-15)</option>
                            <option value="Death">DEATH_OVERS (16-20)</option>
                        </select>
                    </Field>
                </div>
            </div>

            <div style={unifiedGrid}>
                <div style={metricPanel}>
                    <h3 style={sectionLabel}>🏏 BATTING_MODULE</h3>
                    <div style={fieldGrid}>
                        <Field label="RUNS">
                            <input type="number" value={form.runs} onChange={e => set("runs", e.target.value)} style={iccInp} />
                        </Field>
                        <Field label="BALLS_FACED">
                            <input type="number" value={form.balls} onChange={e => set("balls", e.target.value)} style={iccInp} />
                        </Field>
                    </div>
                    <Field label="DISMISSED_BY (BUNNY_TRACKER)">
                        <input placeholder="Bowler Name" value={form.dismissed_by} onChange={e => set("dismissed_by", e.target.value)} style={iccInp} />
                    </Field>
                </div>

                <div style={metricPanel}>
                    <h3 style={sectionLabel}>🎯 BOWLING_MODULE</h3>
                    <div style={fieldGrid}>
                        <Field label="WICKETS">
                            <input type="number" value={form.wickets} onChange={e => set("wickets", e.target.value)} style={iccInp} />
                        </Field>
                        <Field label="CONCEDED">
                            <input type="number" value={form.runs_conceded} onChange={e => set("runs_conceded", e.target.value)} style={iccInp} />
                        </Field>
                        <Field label="BALLS_BOWLED">
                            <input type="number" value={form.balls_bowled} onChange={e => set("balls_bowled", e.target.value)} style={iccInp} />
                        </Field>
                    </div>
                </div>

                <div style={metricPanel}>
                    <h3 style={sectionLabel}>🧤 FIELDING_MODULE</h3>
                    <div style={fieldGrid}>
                        <Field label="CATCHES">
                            <input type="number" value={form.catches} onChange={e => set("catches", e.target.value)} style={iccInp} />
                        </Field>
                        <Field label="STUMPINGS">
                            <input type="number" value={form.stumpings} onChange={e => set("stumpings", e.target.value)} style={iccInp} />
                        </Field>
                    </div>
                </div>
            </div>

            <div style={actionRow}>
                <button onClick={add} style={iccSubmitBtn}>
                    COMMIT_TO_UNIFIED_ANALYTICS_ENGINE
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

/* ================= TACTICAL STYLES ================= */
const iccPageContainer = { background: "transparent", minHeight: "100vh" };
const iccHeaderSection = { background: "rgba(10, 11, 16, 0.95)", padding: "60px 5% 40px", display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)' };
const iccHeaderContent = { maxWidth: "700px" };
const iccTag = { color: "#00f2ff", fontWeight: "900", fontSize: "10px", letterSpacing: '5px' };
const iccTitle = { color: "white", fontSize: "42px", fontWeight: "900", margin: "10px 0", letterSpacing: '-2px' };
const iccSubtitle = { color: "#64748b", fontSize: "14px", fontWeight: '500', opacity: 0.8 };
const previewPanel = { display: 'flex', gap: '15px' };
const previewBox = { background: '#000', padding: '15px 20px', borderTop: '3px solid #00f2ff', minWidth: '140px', boxShadow: '0 0 20px rgba(0, 242, 255, 0.1)' };
const previewLabel = { color: '#64748b', fontSize: '9px', fontWeight: '800', display: 'block', marginBottom: '5px', letterSpacing: '1px' };
const previewValue = { color: '#00f2ff', fontSize: '22px', fontWeight: '900' };
const contentWrapper = { padding: "40px 5%" };
const iccMainCard = { padding: "40px", border: '1px solid rgba(255,255,255,0.05)' };
const formSection = { marginBottom: "30px", padding: '25px', background: 'rgba(0,0,0,0.3)', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.02)' };
const sectionLabel = { fontSize: "10px", color: "#00f2ff", letterSpacing: "2px", marginBottom: "20px", fontWeight: "900" };
const unifiedGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "25px" };
const metricPanel = { background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.05)' };
const fieldGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "15px", marginBottom: '15px' };
const fieldStyle = { display: "flex", flexDirection: "column", gap: "8px" };
const labelStyle = { fontSize: "9px", color: "#64748b", fontWeight: "900", letterSpacing: '1px' };
const iccInp = { padding: "14px", background: "#000", color: "white", border: "1px solid rgba(255,255,255,0.1)", fontSize: '13px', outline: 'none', borderRadius: '2px' };
const actionRow = { marginTop: '40px' };
const iccSubmitBtn = { width: "100%", background: "#00f2ff", color: "#000", border: "none", padding: "20px", fontWeight: "900", cursor: 'pointer', letterSpacing: '2px', borderRadius: '2px', boxShadow: '0 0 20px rgba(0,242,255,0.2)' };