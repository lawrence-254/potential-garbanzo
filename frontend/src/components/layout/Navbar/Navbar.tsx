import {
  Bell,
  Mail,
  LogOut,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


import { useAuth } from "../../../context/authContext/authContext";
import { logoutUser } from "../../../services/api/authApi";

import "./Navbar.css";
export default function Navbar() {
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
    placeholder="Search"
    aria-label="Search"
  />
</div>

      <div className="navbar__actions">
  <button
    className="navbar__icon-button"
    type="button"
    aria-label="Notifications"
  >
    <Bell size={20} />
  </button>

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
            onClick={() => navigate("/profile")}
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