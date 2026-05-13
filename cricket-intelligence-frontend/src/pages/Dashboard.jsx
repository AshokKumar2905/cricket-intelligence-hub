import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useIntelligence } from "../hooks/useIntelligence";
import { TableSkeleton } from "../components/Skeleton";
import { 
  BarChart, Bar, XAxis, Tooltip, 
  ResponsiveContainer, Cell 
} from "recharts";

// Tactical Cyber Palette
const BAR_COLORS = ["#00f2ff", "#38bdf8", "#0ea5e9", "#7dd3fc", "#bae6fd"];

export default function Dashboard() {
  const { metrics, loading } = useIntelligence();
  const [activeTab, setActiveTab] = useState("batting");

  // Aggregate Insights Engine
  const teamChartData = useMemo(() => {
    const totals = {};
    metrics.data.forEach(p => {
      const teamName = p.team || "Independent";
      const runs = Number(p.batting?.runs || 0);
      totals[teamName] = (totals[teamName] || 0) + runs;
    });
    return Object.entries(totals)
      .map(([team, total_runs]) => ({ team, total_runs }))
      .sort((a, b) => b.total_runs - a.total_runs)
      .slice(0, 5);
  }, [metrics.data]);

  const topPlayer = useMemo(() => {
    if (!metrics.data.length) return null;
    return [...metrics.data].sort((a, b) => 
      Number(b.batting?.runs || 0) - Number(a.batting?.runs || 0)
    )[0];
  }, [metrics.data]);

  if (loading) return (
    <div style={{ background: "#05070a", minHeight: "100vh", padding: "100px 8%" }}>
      <TableSkeleton rows={10} />
    </div>
  );

  return (
    <div className="page-fade-in" style={pageContainer}>
      
      {/* 1. TACTICAL BROADCAST HERO */}
      <section style={heroSection}>
        <div style={heroOverlay}>
          <div style={heroTextContent}>
            <span style={heroTag}>📡 LIVE_INTEL_UPLINK_ACTIVE</span>
            <h1 style={heroTitle}>{metrics.tournament.toUpperCase()}_GATEWAY</h1>
            <p style={heroSub}>Unified situational data and real-time performance bio-metrics.</p>
            <div style={heroActions}>
                {["batting", "bowling", "fielding"].map(tab => (
                    <button 
                        key={tab}
                        style={activeTab === tab ? heroActiveBtn : heroBtn} 
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE INTELLIGENCE GRID */}
      <div style={contentPadding}>
        <div style={mainContentLayout}>
            
            {/* LEADERBOARD MODULE */}
            <div style={tableContainerCol}>
                <div className="glass-card" style={glassCardStyle}>
                    <div style={cardHeader}>
                        <h2 style={cardTitle}>📊 {activeTab.toUpperCase()}_LEADERBOARD</h2>
                        <span style={liveStatus}>
                          <span className="live-pulse"></span>ENGINE_OPERATIONAL
                        </span>
                    </div>
                    
                    <div style={{marginTop: '25px', overflowX: 'auto'}} className="icc-table-container">
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>ATHLETE_ID</th>
                                    <th style={thStyle}>AFFILIATION</th>
                                    {activeTab === "batting" && (
                                        <>
                                            <th style={thStyle}>RUNS</th>
                                            <th style={thStyle}>S_RATE</th>
                                        </>
                                    )}
                                    <th style={thStyle}>INTEL_ACCESS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.data.length === 0 ? (
                                    <tr>
                                      <td colSpan="5" style={noDataStyle}>
                                        NO_DATA_STREAM_FOUND. INGEST_SOURCE_TO_BEGIN.
                                      </td>
                                    </tr>
                                ) : (
                                    metrics.data.map((p, i) => {
                                        const playerSlug = encodeURIComponent(p.name).replace(/\//g, "%2F");
                                        return (
                                            <tr key={i}>
                                                <td style={tdStyle}>
                                                    <Link to={`/players/${playerSlug}`} style={playerLink}>
                                                        {p.name.toUpperCase()}
                                                    </Link>
                                                </td>
                                                <td style={tdStyle}>{p.team}</td>
                                                {activeTab === "batting" && (
                                                    <>
                                                        <td style={tdStyle}>{p.batting?.runs || 0}</td>
                                                        <td style={{...tdStyle, color: '#00f2ff'}}>
                                                            {parseFloat(p.batting?.sr || 0).toFixed(2)}
                                                        </td>
                                                    </>
                                                )}
                                                <td>
                                                    <Link to={`/players/${playerSlug}`} style={viewBtn}>
                                                        FETCH_INTEL →
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* INSIGHTS SIDEBAR */}
            <div style={sidebarCol}>
                <div className="glass-card" style={sidebarCard}>
                    <h2 style={cardTitle}>🎯 AGGREGATE_INSIGHTS</h2>
                    <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        <HighlightCard 
                            label="PEAK_PERFORMER" 
                            val={topPlayer?.name || "---"} 
                            sub={`${topPlayer?.batting?.runs || 0} Cumulative Runs`} 
                        />

                        <div className="glass-card" style={protocolCard}>
                            <h4 style={protocolTitle}>SYSTEM_PROTOCOL</h4>
                            <p style={protocolText}>
                              Metric resolution derived from unified ball-by-ball datasets.
                            </p>
                        </div>

                        <div style={{marginTop: '10px'}}>
                           <h4 style={teamHeader}>DISTRIBUTION_LOGISTICS</h4>
                           <div style={chartWrapper}>
                            <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={teamChartData}>
                                        <XAxis dataKey="team" hide />
                                        <Tooltip 
                                            contentStyle={tooltipStyle} 
                                            cursor={{fill: 'rgba(255,255,255,0.03)'}} 
                                        />
                                        <Bar dataKey="total_runs" radius={[2, 2, 0, 0]}>
                                            {teamChartData.map((e, i) => (
                                                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

/* HELPER COMPONENTS */
function HighlightCard({ label, val, sub }) {
    return (
      <div className="glass-card" style={highlightCardStyle}>
        <span style={highlightLabel}>{label}</span>
        <h3 style={highlightVal}>{val}</h3>
        <p style={highlightSub}>{sub}</p>
      </div>
    );
}

/* ================= TACTICAL STYLES ================= */
const pageContainer = { background: "transparent", minHeight: "100vh", paddingBottom: '80px', color: 'white' };
const heroSection = { height: '400px', display: 'flex', alignItems: 'center', background: 'linear-gradient(to bottom, #00195a, #05070a)', padding: '0 8%' };
const heroOverlay = { width: '100%' };
const heroTextContent = { maxWidth: '750px' };
const heroTag = { color: "#00f2ff", fontWeight: "900", fontSize: "11px", letterSpacing: "5px" };
const heroTitle = { fontSize: "clamp(30px, 5vw, 60px)", fontWeight: "900", margin: "15px 0", lineHeight: 1 };
const heroSub = { color: '#94a3b8', fontSize: '16px', marginBottom: '35px', fontWeight: '500', opacity: 0.8 };

const heroActions = { display: "flex", gap: "10px" };
const heroBtn = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", padding: "10px 20px", cursor: "pointer", fontWeight: "800", fontSize: "10px" };
const heroActiveBtn = { ...heroBtn, background: "#00f2ff", color: "#000000", border: "none" };

const contentPadding = { padding: "0 5%", marginTop: '-50px', position: 'relative', zIndex: 10 };
const mainContentLayout = { display: "flex", gap: "25px", flexWrap: "wrap" };
const tableContainerCol = { flex: '1 1 850px', minWidth: '350px' };
const sidebarCol = { flex: '1 1 350px', minWidth: '350px' };

const glassCardStyle = { padding: "30px", border: '1px solid rgba(255,255,255,0.05)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const liveStatus = { fontSize: '9px', color: '#64748b', fontWeight: '900', display: 'flex', alignItems: 'center', letterSpacing: '2px' };

const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thStyle = { padding: '15px', color: '#00f2ff', fontSize: '9px', fontWeight: '900', textAlign: 'left', borderBottom: '2px solid #00f2ff' };
const tdStyle = { padding: '16px 15px', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.05)' };
const playerLink = { color: "white", textDecoration: "none" };
const viewBtn = { background: 'rgba(0,242,255,0.08)', color: '#00f2ff', padding: '8px 14px', borderRadius: '2px', fontSize: '9px', fontWeight: '900', textDecoration: 'none', border: '1px solid rgba(0,242,255,0.2)' };

const sidebarCard = { padding: "25px" };
const cardTitle = { fontSize: "11px", fontWeight: "900", color: "#00f2ff", letterSpacing: '2px' };
const highlightCardStyle = { padding: '20px', borderLeft: '3px solid #00f2ff', background: 'rgba(255,255,255,0.02)' };
const highlightLabel = { fontSize: '9px', color: '#64748b', fontWeight: '900', letterSpacing: '1px' };
const highlightVal = { margin: '8px 0', fontSize: '20px', fontWeight: '900' };
const highlightSub = { margin: 0, fontSize: '12px', color: '#0ea5e9', fontWeight: '700' };

const protocolCard = { padding: '18px', borderLeft: '3px solid #38bdf8', background: 'rgba(0,0,0,0.2)' };
const protocolTitle = { fontSize: '10px', color: '#38bdf8', fontWeight: '900', marginBottom: '4px' };
const protocolText = { fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.5 };
const teamHeader = { fontSize: '10px', color: '#64748b', marginBottom: '12px', fontWeight: '900' };
const chartWrapper = { background: 'rgba(0,0,0,0.4)', padding: '15px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' };
const tooltipStyle = { background: '#05070a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '10px' };
const noDataStyle = { textAlign: 'center', padding: '40px', color: '#475569', fontSize: '11px', fontWeight: '800', letterSpacing: '2px' };