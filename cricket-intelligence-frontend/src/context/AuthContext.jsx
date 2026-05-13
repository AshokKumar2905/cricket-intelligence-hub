import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  /**
   * Persistence Logic: 
   * Restores user session from localStorage and validates it with the backend.
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("cricket_token");
      
      if (!token) {
        setChecking(false);
        return;
      }

      // Automatically attach token to all future API calls
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        const res = await api.get("/verify-token");
        // Rebuild user state from backend response [Matches app.py: verify_token]
        if (res.data.status === "success") {
          setUser(res.data.data.username);
        }
      } catch (err) {
        // Token is likely expired or forged
        console.warn("Security session compromised or expired. Purging context.");
        localStorage.removeItem("cricket_token");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
      } finally {
        setChecking(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Action: login
   * Links to @app.route("/login") in backend/app.py
   */
  const login = async (username, password) => {
    try {
      const res = await api.post("/login", { username, password });
      const { token, username: uname } = res.data.data;

      localStorage.setItem("cricket_token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(uname);
      return uname;
    } catch (err) {
      throw err; // Captured by Login.jsx for Toast feedback
    }
  };

  /**
   * Action: logout
   * Cleans up both local and global authentication states.
   */
  const logout = () => {
    // We prioritize local purge to ensure immediate UI response
    localStorage.removeItem("cricket_token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    
    // Optional: Send async notification to backend if needed later
    api.post("/logout").catch(() => {
      /* Silently fail if logout route isn't implemented on Flask */
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, checking }}>
      {/* prevents the App from flickering/redirecting while validating the session */}
      {!checking ? children : (
        <div style={loadingOverlay}>
          <div className="shimmer-text">ESTABLISHING SECURE GATEWAY...</div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

/* ================= THEMED STYLES ================= */

const loadingOverlay = {
  height: '100vh',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: '#06083b', // Matches --icc-navy
  color: '#e91052',      // Matches --icc-magenta
  fontWeight: '900',
  fontSize: '14px',
  letterSpacing: '3px',
  textAlign: 'center',
  textTransform: 'uppercase'
};