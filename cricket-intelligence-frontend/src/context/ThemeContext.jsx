import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  /**
   * Persistence Logic: 
   * Defaults to Dark Mode (#06083b) for the high-end analyst aesthetic.
   */
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("cricket_theme");
    // Standardizing on 'dark' as the mechanical default for analytics
    return saved ? saved === "dark" : true; 
  });

  /**
   * Action: Apply Theme
   * Updates the 'data-theme' attribute on the root element.
   * This allows for CSS variable usage like: var(--bg-primary).
   */
  useEffect(() => {
    const themeValue = dark ? "dark" : "light";
    localStorage.setItem("cricket_theme", themeValue);
    
    // Injecting theme into the DOM root
    document.documentElement.setAttribute("data-theme", themeValue);
    
    // Synchronizing the body background to prevent visual artifacts
    // Dark: #06083b (ICC Navy) | Light: #f8fafc (Slate 50)
    document.body.style.backgroundColor = dark ? "#06083b" : "#f8fafc";
    document.body.style.color = dark ? "#ffffff" : "#0f172a";
    
    // Smooth transition for user comfort
    document.body.style.transition = "background-color 0.3s ease, color 0.3s ease";
  }, [dark]);

  const toggle = () => setDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}