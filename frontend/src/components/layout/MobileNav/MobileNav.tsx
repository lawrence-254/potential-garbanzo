import { NavLink } from "react-router-dom";
import {
  Bookmark,
  Home,
  MessageCircle,
  User,
} from "lucide-react";

import "./MobileNav.css";

export default function MobileNav() {
  return (
    <nav className="mobile-nav">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `mobile-nav__link ${
            isActive ? "mobile-nav__link--active" : ""
          }`
        }
      >
        <Home size={21} />
        <span>Home</span>
      </NavLink>


      <NavLink
        to="/messages"
        className={({ isActive }) =>
          `mobile-nav__link ${
            isActive ? "mobile-nav__link--active" : ""
          }`
        }
      >
        <MessageCircle size={21} />
        <span>Messages</span>
      </NavLink>

      <NavLink
        to="/bookmarks"
        className={({ isActive }) =>
          `mobile-nav__link ${
            isActive ? "mobile-nav__link--active" : ""
          }`
        }
      >
        <Bookmark size={21} />
        <span>Saved</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `mobile-nav__link ${
            isActive ? "mobile-nav__link--active" : ""
          }`
        }
      >
        <User size={21} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
