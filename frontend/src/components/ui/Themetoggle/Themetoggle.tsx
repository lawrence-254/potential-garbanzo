import { Moon, Sun } from "lucide-react";

import { useTheme } from "../../../context/ThemeContext/ThemeContext";

import "./ThemeToggle.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span className="theme-toggle__icon">
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </span>

      <span className="theme-toggle__label">
        {isDark ? "Light mode" : "Dark mode"}
      </span>
    </button>
  );
}