import {
  Bookmark,
  Home,
  MessageCircle,
  Search,
  Settings,
  User,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import Button from "../../ui/Button/Button";
import ThemeToggle from "../../ui/ThemeToggle/ThemeToggle";

import "./Sidebar.css";

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar__content">
        <div className="sidebar__navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
          >
            <Home size={21}/>
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
          >
            <Search size={21}/>
            <span>Explore</span>
          </NavLink>

          <NavLink
            to="/messages"
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
          >
            <MessageCircle size={21}/>
            <span>Messages</span>
          </NavLink>

          <NavLink
            to="/bookmarks"
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
          >
            <Bookmark size={21}/>
            <span>Bookmarks</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
          >
            <User size={21}/>
            <span>Profile</span>
          </NavLink>
        </div>
<div className="sidebar__create">
  <Button fullWidth>
    Create post
  </Button>
</div>
        <div className="sidebar__bottom">
          <div className="sidebar__divider" />

          <ThemeToggle />

          <button className="sidebar__settings" type="button">
            <Settings size={21}/>
            <span>Settings</span>
          </button>
        </div>
      </div>
    </nav>
  );
}