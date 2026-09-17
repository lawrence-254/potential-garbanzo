import {
  Bell,
  Mail,
  LogOut,
  Search,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


import { useAuth } from "../../../context/authContext/authContext";
import { logoutUser } from "../../../services/api/authApi";

import "./Navbar.css";
import NotificationPanel from "../../notifications/NotificationPanel/NotificationPanel";
export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] =
  useState(false);
  const navigate = useNavigate();
  const { user, clearUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutUser();
      clearUser();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <a href="/" className="navbar__logo">
          <span className="navbar__logo-mark">R</span>
          <span className="navbar__logo-text">Royal</span>
        </a>

        <div className="navbar__search">
  <Search
    className="navbar__search-icon"
    size={18}
  />

  <input
  type="search"
  value={searchQuery}
  onChange={(event) =>
    setSearchQuery(event.target.value)
  }
  onKeyDown={(event) => {
    if (event.key === "Enter") {
      setShowNotifications(false);
      navigate(
        `/explore?q=${encodeURIComponent(
          searchQuery,
        )}`,
      );
    }
  }}
  placeholder="Search"
  aria-label="Search"
/>
</div>

      <div className="navbar__actions">
  <div className="navbar__notification">
  <button
    type="button"
    className="navbar__icon-button"
    onClick={() =>
      setShowNotifications((current) => !current)
    }
    aria-label="Notifications"
    aria-expanded={showNotifications}
  >
    <Bell size={20} />
  </button>

  {showNotifications && (
    <NotificationPanel
      onClose={() => setShowNotifications(false)}
    />
  )}
</div>

  <button
    className="navbar__icon-button"
    type="button"
    aria-label="Messages"
  >
    <Mail size={20} />
  </button>

 <button
            className="navbar__avatar"
            type="button"
            aria-label="Open profile"
            onClick={() => {
  setShowNotifications(false);
  navigate("/profile");
}}
          >
            {user?.displayName?.charAt(0).toUpperCase() || "U"}
          </button>

          <button
            className="navbar__icon-button"
            type="button"
            aria-label="Log out"
            onClick={handleLogout}
          >
            <LogOut size={20} />
          </button>
</div>
      </div>
    </header>
  );
}