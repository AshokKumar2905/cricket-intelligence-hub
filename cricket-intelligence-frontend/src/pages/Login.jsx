import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault(); 
    
    if (!username || !password) { 
      addToast("Credentials required for engine access", "error"); 
      return; 
    }

    setLoading(true);
    try {
      await login(username, password);
      addToast("Intelligence Gateway Established. Welcome, Operator.");
      navigate("/dashboard"); 
    } catch (err) {
      const msg = err.response?.data?.message || "Authentication Failed: Invalid Identity";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={iccLoginPage}>
      <div style={iccLoginBox} className="page-fade-in glass-card">
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={iccBrandLogo}>📡</div>
          <h1 style={iccLoginTitle}>INTEL_GATEWAY</h1>
          <p style={iccLoginSubtitle}>RESTRICTED_OPERATOR_ACCESS</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={fieldWrap}>
            <label style={iccLabel}>OPERATOR_IDENTITY</label>
            <input
              style={iccInput}
              placeholder="Username"
              value={username}
              autoComplete="username"
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={fieldWrap}>
            <label style={iccLabel}>ACCESS_KEY</label>
            <input
              style={iccInput}
              type="password"
              placeholder="••••••••"
              value={password}
              autoComplete="current-password"
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading} 
            style={{ 
              ...iccBtn, 
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "ESTABLISHING_UPLINK..." : "INITIALIZE_ENGINE →"}
          </button>
        </form>

        <div style={iccLoginFooter}>
          <p style={iccHintText}>
            SECURE_ENVIRONMENT: SYSTEM_MONITORING_ACTIVE
          </p>
          <div style={badgeContainer}>
             <p style={{ ...iccHintText, color: "#00f2ff" }}>
               DEFAULT_NODE: admin / cricket123
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= TACTICAL THEME STYLES ================= */
const iccLoginPage = { 
  minHeight: "100vh", 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center", 
  background: "transparent", /* Inherits Grid from index.css */
  width: "100%",
  fontFamily: "'Inter', sans-serif"
};

const iccLoginBox = { 
  background: "rgba(10, 11, 16, 0.95)", 
  padding: "60px 45px", 
  width: "100%", 
  maxWidth: 420, 
  textAlign: "center",
  border: "1px solid rgba(255, 255, 255, 0.08)"
};

const iccBrandLogo = { fontSize: 50, marginBottom: 10, filter: 'drop-shadow(0 0 15px #00f2ff)' };
const iccLoginTitle = { color: "#ffffff", fontWeight: 900, fontSize: "26px", margin: "0 0 5px", letterSpacing: "4px" };
const iccLoginSubtitle = { color: "#00f2ff", margin: 0, fontSize: "9px", fontWeight: "900", letterSpacing: "3px" };
const fieldWrap = { marginBottom: 25, textAlign: "left" };
const iccLabel = { color: "#64748b", fontSize: "9px", fontWeight: "900", display: "block", marginBottom: 10, letterSpacing: "2px" };

const iccInput = { 
  width: "100%", 
  padding: "16px", 
  borderRadius: "2px", 
  border: "1px solid rgba(255, 255, 255, 0.1)", 
  background: "#000000", 
  color: "#ffffff", 
  fontSize: "13px", 
  boxSizing: "border-box", 
  outline: "none", 
  fontWeight: "600",
  transition: "border-color 0.3s ease"
};

const iccBtn = { 
  width: "100%", 
  padding: "18px", 
  borderRadius: "2px", 
  background: "#00f2ff", 
  color: "#000000", 
  fontWeight: "900", 
  fontSize: "12px", 
  border: "none", 
  marginTop: 10, 
  letterSpacing: "2px", 
  boxShadow: "0 0 20px rgba(0, 242, 255, 0.3)",
  transition: "all 0.3s ease"
};

const iccLoginFooter = { marginTop: 40 };
const badgeContainer = { marginTop: 12, padding: '12px', background: 'rgba(0, 242, 255, 0.03)', borderRadius: '2px', border: '1px solid rgba(0, 242, 255, 0.1)' };
const iccHintText = { color: "#475569", fontSize: "9px", margin: 0, textTransform: "uppercase", fontWeight: "800", letterSpacing: "1.5px" };