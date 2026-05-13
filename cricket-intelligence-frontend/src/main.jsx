import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

/* ================= GLOBAL ASSETS ================= */
/**
 * index.css: Core Tactical Design System (Tailwind v4, Grid, and Glassmorphism).
 * app.css: Component-specific overrides and legacy utility support.
 */
import "./index.css"; 
import "./App.css"; 

/* ================= CONTEXT PROVIDERS ================= */
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";

/**
 * Platform Initialization Protocol
 * Hierarchy Logic:
 * 1. ThemeProvider: Establishes the #05070a baseline immediately to prevent visual artifacts.
 * 2. AuthProvider: Injects security headers into the API uplink.
 * 3. ToastProvider: System-wide alert gateway for intelligence logging.
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);