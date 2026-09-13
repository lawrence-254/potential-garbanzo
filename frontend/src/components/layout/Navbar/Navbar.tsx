import {
  Bell,
  Mail,
  Search,
} from "lucide-react";

import "./Navbar.css";
export default function Navbar() {
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
  >
    L
  </button>
</div>
      </div>
    </header>
  );
}