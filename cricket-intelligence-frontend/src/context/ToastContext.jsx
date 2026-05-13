import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /**
   * Action: addToast
   * Using useCallback to ensure this function remains stable across renders.
   */
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-clear logic: 4s for optimal readability
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000); 
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast Notification Stack */}
      <div style={container}>
        {toasts.map(t => (
          <div
            key={t.id}
            className="page-fade-in"
            style={{ 
              ...toastBase, 
              ...(t.type === "error" ? toastError : t.type === "info" ? toastInfo : toastSuccess) 
            }}
            onClick={() => removeToast(t.id)}
            onMouseOver={e => e.currentTarget.style.transform = "translateX(-5px)"}
            onMouseOut={e => e.currentTarget.style.transform = "translateX(0)"}
          >
            <div style={iconWrapper}>
              {t.type === "error" ? "⚠️" : t.type === "info" ? "🔍" : "📊"}
            </div>
            <div style={messageContent}>
              <span style={typeLabel}>{t.type.toUpperCase()} STATUS</span>
              <div style={textBody}>{t.message}</div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

/* ================= THEMED ANALYST STYLES ================= */

const container = {
  position: "fixed",
  bottom: 30,
  right: 30,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  zIndex: 10000,
  pointerEvents: "none"
};

const toastBase = {
  padding: "16px 20px",
  borderRadius: "2px", // Sharp analyst edges
  color: "white",
  boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
  cursor: "pointer",
  pointerEvents: "all",
  display: "flex",
  alignItems: "center",
  minWidth: 320,
  maxWidth: 450,
  borderLeft: "4px solid rgba(255,255,255,0.4)",
  backdropFilter: "blur(12px)",
  transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
};

const iconWrapper = {
  fontSize: "20px",
  marginRight: "15px",
  display: "flex",
  alignItems: "center",
  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
};

const messageContent = {
  display: "flex",
  flexDirection: "column",
  gap: "2px"
};

const typeLabel = {
  fontSize: "9px",
  fontWeight: "900",
  letterSpacing: "2.5px",
  opacity: 0.7,
  textTransform: 'uppercase'
};

const textBody = {
  fontSize: "13px",
  fontWeight: "800",
  lineHeight: "1.4",
  letterSpacing: '-0.2px'
};

const toastSuccess = { background: "rgba(16, 185, 129, 0.95)", borderLeft: "4px solid #059669" }; 
const toastError   = { background: "rgba(233, 16, 82, 0.95)", borderLeft: "4px solid #9f1239" }; 
const toastInfo    = { background: "rgba(56, 189, 248, 0.95)", borderLeft: "4px solid #0ea5e9" };