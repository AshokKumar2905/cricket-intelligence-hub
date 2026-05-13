import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, Cell
} from "recharts";

const API_BASE = "http://127.0.0.1:5000";

/**
 * SummaryCard: Upgraded with Cyber-Cyan Logic
 */
function SummaryCard({ label, val, color = "#fff", isWarning = false }) {
  return (
    <div className="glass-card" style={{...intelMiniCard, borderLeft: `4px solid ${isWarning ? '#ff0055' : '#00f2ff'}`}}>
      <p style={{...miniLabel, color: isWarning ? '#ff0055' : '#64748b'}}>{label}</p>
      <p style={{...miniValue, color}}>{val}</p>
    </div>
  );
}

function PlayerDetail() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic Background: Deep charcoal gradient for high contrast
  const heroBg = useMemo(() => 
    `https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=1600&sig=${Math.random()}`, 
  []);

  useEffect(() => {
    const fetchPlayerData = async () => {
      setLoading(true);
      try {
        const playersRes = await api.get("/players");
        const roster = playersRes.data.data || [];
        const targetIdentifier = decodeURIComponent(id).trim().toLowerCase();

        const found = roster.find(p => 
          String(p.id || p._id).toLowerCase() === targetIdentifier || 
          p.name.toLowerCase() === targetIdentifier
        );

        const playerNode = found || { name: decodeURIComponent(id), role: "Athlete" };
        setPlayer(playerNode);
        
        const safeUrlName = encodeURIComponent(playerNode.name).replace(/\//g, "%2F");

        const [statsRes, intelRes] = await Promise.allSettled([
          api.get("/dashboard-all"),
          api.get(`/player-intelligence/${safeUrlName}`)
        ]);

        if (statsRes.status === "fulfilled") {
          const allStats = statsRes.value.data.data || [];
          const myStats = allStats.find(s => s.name.toLowerCase() === playerNode.name.toLowerCase());
          setStats(myStats || {});
        }

        if (intelRes.status === "fulfilled") {
          setIntel(intelRes.value.data.data);
        }
      } catch (err) {
        console.error("Intelligence synchronization fault:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPlayerData();
  }, [id]);

  if (loading) return (
    <div style={loadingState}>
      <div style={loadingBarContainer}><div className="shimmer-effect" style={loadingBar}></div></div>
      <h2 style={loadingText}>SYNCHRONIZING_BIO_METRICS...</h2>
    </div>
  );

  if (!player) return (
    <div className="glass-card" style={errorState}>
      <h2 style={errorTitle}>ATHLETE_NODE_OFFLINE</h2>
      <button onClick={() => navigate("/dashboard")} style={iccBackBtn}>RETURN_TO_HUB</button>
    </div>
  );

  return (
    <div className="page-fade-in" style={pageBg}>
      {/* 1. TACTICAL PROFILE HERO */}
      <div style={{ ...iccHeroHeader, backgroundImage: `url(${heroBg})` }}>
        <div style={iccHeroOverlay}>
          <div style={iccHeroContent}>
            <button onClick={() => navigate("/dashboard")} style={iccBackBtn}>← COMMAND_CENTER</button>
            <div style={iccProfileRow}>
              <div style={iccAvatarGlowContainer}>
                <div style={iccAvatarContainer}>
                  {player.photo ? (
                    <img src={`${API_BASE}${player.photo}`} alt={player.name} style={iccProfileImage} />
                  ) : (
                    <div style={iccProfileFallback}>{player.name?.[0]}</div>
                  )}
                </div>
              </div>
              <div style={iccIdentity}>
                <span style={iccTag}>RESTRICTED_INTEL_PROFILE</span>
                <h1 style={iccName}>{player.name?.toUpperCase()}</h1>
                <div style={iccBadgeRow}>
                   <span style={iccRoleBadge}>{(player.role || "Athlete").toUpperCase()}</span>
                   <span style={iccTeamBadge}>{stats?.team || "INTERNATIONAL_NODE"}</span>
                   <span style={iccIdBadge}>ACTIVE_UPLINK</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={iccDataContainer}>
        {/* 2. ANALYTICS SUMMARY (Tactical Grid) */}
        <div style={intelSummaryRow}>
          <SummaryCard label="INNINGS_PROCESSED" val={stats?.innings || intel?.innings_played || 0} />
          <SummaryCard 
            label="BUNNY_TRACKER" 
            val={intel?.bunny_bowler || "NONE"} 
            color="#ff0055" 
            isWarning={intel?.bunny_bowler && intel.bunny_bowler !== "None"}
          />
          <SummaryCard label="STRIKE_RATE" val={stats?.batting?.sr || "0.00"} color="#00f2ff" />
          <SummaryCard label="SEASON_RUNS" val={stats?.batting?.runs || 0} />
        </div>

        {/* 3. VISUAL INTELLIGENCE GRID */}
        {intel && (intel.phase_performance?.length > 0 || (intel.best_matchups && intel.best_matchups.length > 0)) ? (
            <div style={intelGrid}>
                <div className="glass-card" style={glassIntelCard}>
                    <h4 style={intelHeader}>PHASE_STRIKE_RATE_RADAR</h4>
                    <ResponsiveContainer width="100%" height={320}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={intel.phase_performance || []}>
                            <PolarGrid stroke="rgba(255,255,255,0.05)" />
                            <PolarAngleAxis dataKey="phase" stroke="#64748b" fontSize={11} fontWeight="900" />
                            <Radar name="SR" dataKey="sr" stroke="#00f2ff" fill="#00f2ff" fillOpacity={0.4} />
                            <Tooltip contentStyle={tooltipStyle} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-card" style={glassIntelCard}>
                    <h4 style={intelHeader}>DOMINANCE_MATRIX</h4>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={intel.best_matchups || []}>
                            <XAxis dataKey="bowler" hide />
                            <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(255,255,255,0.03)'}} />
                            <Bar dataKey="runs" radius={[2, 2, 0, 0]} barSize={45}>
                               {(intel.best_matchups || []).map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={index === 0 ? '#ff0055' : '#00f2ff'} />
                               ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        ) : (
            <div className="glass-card" style={noDataHint}>
                <div style={{fontSize: '40px', marginBottom: '20px', color: '#ff0055'}}>⚠️</div>
                <h3 style={{color: 'white', marginBottom: '10px'}}>INTELLIGENCE_OFFLINE</h3>
                <p style={{color: '#64748b'}}>No ball-by-ball mapping identified for {player?.name.toUpperCase()}.</p>
            </div>
        )}
      </div>
    </div>
  );
}

/* ================= TACTICAL STYLES ================= */
const pageBg = { minHeight: "100vh", color: 'white', paddingBottom: '100px' };
const iccHeroHeader = { height: "450px", backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' };
const iccHeroOverlay = { width: "100%", height: "100%", display: "flex", alignItems: "flex-end", padding: "80px 8%", background: 'linear-gradient(to bottom, rgba(5,7,10,0.2), rgba(5,7,10,1))' };
const iccHeroContent = { width: "100%", maxWidth: "1400px", margin: "0 auto" };
const iccAvatarGlowContainer = { position: 'relative', padding: '10px' };
const iccAvatarContainer = { width: "160px", height: "160px", border: "4px solid #00f2ff", background: '#05070a', overflow: 'hidden', borderRadius: '4px', boxShadow: '0 0 30px rgba(0,242,255,0.2)' };
const iccProfileImage = { width: "100%", height: "100%", objectFit: "cover" };
const iccProfileFallback = { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "72px", fontWeight: "900", color: "#00f2ff" };
const iccProfileRow = { display: "flex", alignItems: "center", gap: "45px", flexWrap: 'wrap' };
const iccIdentity = { flex: 1, minWidth: '300px' };
const iccTag = { color: "#00f2ff", fontWeight: "900", fontSize: "11px", letterSpacing: "5px" };
const iccName = { fontSize: "clamp(32px, 5vw, 56px)", fontWeight: "900", color: "white", margin: "10px 0", letterSpacing: '-2px' };
const iccBadgeRow = { display: "flex", gap: "15px", flexWrap: 'wrap' };
const iccRoleBadge = { background: "#00f2ff", color: "#05070a", padding: "8px 20px", fontSize: "10px", fontWeight: "900", borderRadius: '2px' };
const iccTeamBadge = { background: "rgba(255,255,255,0.03)", border: '1px solid rgba(255,255,255,0.08)', color: "white", padding: "8px 20px", fontSize: "10px", fontWeight: "900", borderRadius: '2px' };
const iccIdBadge = { color: "#475569", fontSize: "10px", fontWeight: "800", alignSelf: 'center', letterSpacing: '1px' };
const iccDataContainer = { padding: "0 8%", maxWidth: "1400px", margin: "-60px auto 0", position: 'relative', zIndex: 20 };
const intelSummaryRow = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px', marginBottom: '40px' };
const intelMiniCard = { padding: '30px' };
const miniLabel = { fontSize: '9px', fontWeight: '900', letterSpacing: '2px', marginBottom: '10px', textTransform: 'uppercase' };
const miniValue = { fontSize: '30px', fontWeight: '900', margin: 0, letterSpacing: '-1px' };
const intelGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px' };
const glassIntelCard = { padding: '35px' };
const intelHeader = { fontSize: '10px', color: '#00f2ff', letterSpacing: '2px', marginBottom: '30px', fontWeight: '900', textTransform: 'uppercase' };
const tooltipStyle = { background: '#05070a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '10px' };
const noDataHint = { textAlign: 'center', padding: '100px 40px', marginTop: '40px' };
const iccBackBtn = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", padding: "10px 20px", fontSize: "9px", fontWeight: "900", cursor: "pointer", marginBottom: '25px', borderRadius: '2px', letterSpacing: '1px' };
const loadingState = { height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#05070a' };
const loadingBarContainer = { width: '200px', height: '4px', background: '#1e293b', position: 'relative', overflow: 'hidden' };
const loadingBar = { position: 'absolute', width: '100%', height: '100%', background: '#00f2ff' };
const loadingText = { color: '#00f2ff', letterSpacing: '4px', fontSize: '11px', fontWeight: '900', marginTop: '20px' };
const errorState = { margin: '100px auto', maxWidth: '500px', padding: '50px', textAlign: 'center' };
const errorTitle = { color: "#ff0055", fontSize: '18px', fontWeight: '900', marginBottom: '20px', letterSpacing: '2px' };

export default PlayerDetail;