import { BrowserRouter as Router, Routes, Route, NavLink, Link, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Analytics Module Imports
import DataUpload from "./pages/DataUpload";
import Players from "./pages/Players";
import Matches from "./pages/Matches";
import Performance from "./pages/Performance";
import Dashboard from "./pages/Dashboard";
import PlayerDetail from "./pages/PlayerDetail";
import Login from "./pages/Login";

/**
 * App: Tactical Intelligence Shell
 * Synchronized with Cyber-Grid Theme and Professional Logic.
 */
function App() {
  const { user, logout } = useAuth();

  return (
    <Router>
      <div style={iccShell}>
        
        {/* 1. TACTICAL NAVIGATION HEADER */}
        <header style={iccHeader}>
          <div style={navContainer}>
            
            {/* BRANDING NODE: Cyan Accent */}
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <div style={logoGroup}>
                <span style={logoIcon}>📡</span>
                <h2 style={iccLogo}>INTEL_GATEWAY</h2>
              </div>
            </Link>
            
            {/* OPERATIONAL GATEWAYS: Technical Labeling */}
            <nav style={topLinks}>
              <TopNavItem to="/dashboard" label="COMMAND_CENTER" />
              <TopNavItem to="/upload" label="DATA_INGESTION" />
              <TopNavItem to="/matches" label="MATCH_LOGS" />
              <TopNavItem to="/players" label="ATHLETE_INTEL" />
              <TopNavItem to="/performance" label="EVENT_LOGGING" />
            </nav>

            {/* SYSTEM ACTIONS */}
            <div style={rightActions}>
              <div style={searchWrap}>
                <input 
                  type="text" 
                  placeholder="QUERY ENGINE..." 
                  style={iccSearchInput} 
                />
                <span style={searchIcon}>🔍</span>
              </div>
              
              {user ? (
                <div style={userNode}>
                  <span style={userName}>OPERATOR: {user.toUpperCase()}</span>
                  <button onClick={logout} style={logoutBtn}>TERMINATE</button>
                </div>
              ) : (
                <NavLink to="/login" style={signInBtn}>OPERATOR_ACCESS</NavLink>
              )}
            </div>
          </div>
        </header>

        {/* 2. DYNAMIC ANALYTICS VIEWPORT */}
        <main style={iccMain}>
          <div style={viewportContainer}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route 
                path="/upload" 
                element={user ? <DataUpload /> : <Navigate to="/login" replace />} 
              /> 
              <Route path="/players" element={<Players />} />
              <Route path="/players/:id" element={<PlayerDetail />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/performance" element={<Performance />} />
              <Route 
                path="/login" 
                element={!user ? <Login /> : <Navigate to="/dashboard" replace />} 
              />
              <Route path="*" element={<div style={errorPage}>404 | ENGINE_COMPONENT_NOT_FOUND</div>} />
            </Routes>
          </div>
        </main>

        {/* 3. SYSTEM FOOTER: Real-time Status Indicators */}
        <footer style={iccFooter}>
          <div style={footerContent}>
            <p style={copyright}>© 2026 CRICKET ANALYST INTELLIGENCE GATEWAY. SECURE PROTOCOL ACTIVE.</p>
            <div style={footerStatus}>
              <span style={statusNode}>UPLINK: <span style={{color: user ? '#00f2ff' : '#ff0055'}}>{user ? 'AUTHORIZED' : 'RESTRICTED'}</span></span>
              <span style={statusNode}>VERSION: 5.0.0-CYBER</span>
              <span style={statusNode}>SOCKET: 127.0.0.1:5000</span>
            </div>
          </div>
        </footer>

      </div>
    </Router>
  );
}

/**
 * TopNavItem: Updated with Cyber-Cyan active states
 */
function TopNavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        color: isActive ? "#ffffff" : "#94a3b8",
        textDecoration: "none",
        fontSize: "10px",
        fontWeight: "900",
        letterSpacing: "1.5px",
        padding: "0 15px",
        height: "75px",
        display: "flex",
        alignItems: "center",
        borderBottom: isActive ? "4px solid #00f2ff" : "4px solid transparent",
        background: isActive ? "rgba(0, 242, 255, 0.05)" : "transparent",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      })}
    >
      {label}
    </NavLink>
  );
}

/* ================= UPDATED TACTICAL STYLES ================= */

const iccShell = { 
  display: "flex", 
  flexDirection: "column", 
  minHeight: "100vh", 
  background: "#05070a" 
};

const iccHeader = { 
  background: "rgba(10, 11, 16, 0.95)", 
  height: "75px", 
  display: "flex", 
  alignItems: "center", 
  borderBottom: "1px solid rgba(255,255,255,0.08)", 
  position: "sticky", 
  top: 0, 
  zIndex: 1000, 
  backdropFilter: "blur(10px)"
};

const navContainer = { width: "100%", maxWidth: "1600px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 40px" };
const logoGroup = { display: "flex", alignItems: "center", gap: "10px" };
const logoIcon = { fontSize: '20px' };
const iccLogo = { color: "#00f2ff", fontSize: "16px", fontWeight: "900", letterSpacing: "3px", margin: 0 };
const topLinks = { display: "flex", height: "75px", alignItems: "center", marginLeft: "30px" };
const rightActions = { display: "flex", alignItems: "center", gap: "20px" };

const searchWrap = { position: "relative", display: "flex", alignItems: "center" };
const searchIcon = { position: "absolute", right: "12px", color: "#00f2ff", fontSize: "12px" };
const iccSearchInput = { background: "#000000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "2px", padding: "10px 35px 10px 15px", color: "white", fontSize: "10px", fontWeight: "800", width: "180px", outline: 'none' };

const signInBtn = { background: "#00f2ff", color: "#000000", padding: "10px 18px", borderRadius: "2px", fontSize: "10px", fontWeight: "900", textDecoration: "none", letterSpacing: "1px", boxShadow: "0 0 15px rgba(0, 242, 255, 0.4)" };
const userNode = { display: 'flex', alignItems: 'center', gap: '15px' };
const userName = { color: '#00f2ff', fontSize: '9px', fontWeight: '900', letterSpacing: '1px' };
const logoutBtn = { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', fontSize: '9px', fontWeight: '900', cursor: 'pointer' };

const iccMain = { width: "100%", flex: 1, display: "flex", flexDirection: "column" };
const viewportContainer = { width: "100%", flex: 1 };

const iccFooter = { background: "#000000", padding: "40px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" };
const footerContent = { maxWidth: "1200px", margin: "0 auto", textAlign: 'center' };
const copyright = { color: "#475569", fontSize: "9px", fontWeight: "800", letterSpacing: '1px', margin: 0 };
const footerStatus = { display: "flex", justifyContent: "center", gap: "30px", marginTop: "15px" };
const statusNode = { color: "#64748b", fontSize: "10px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "1px" };
const errorPage = { color: 'white', padding: '150px', textAlign: 'center', fontSize: '14px', fontWeight: '900', letterSpacing: '4px', opacity: 0.5 };

export default App;