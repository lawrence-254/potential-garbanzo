import {
  Bell,
  Mail,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/authContext/authContext";
import { logoutUser } from "../../../services/api/authApi";
import { useNotifications } from "../../../context/NotiificationContext/NotificationContext";
import { useMessages } from "../../../context/MessageContext/MessageContext";
import UserSearch from "../../../components/search/UserSearch/UserSearch";

import "./Navbar.css";
import NotificationPanel from "../../notifications/NotificationPanel/NotificationPanel";

export default function Navbar() {
  const [showNotifications, setShowNotifications] =
    useState(false);

  const navigate = useNavigate();

  const { user, clearUser } = useAuth();

  const {
    unreadCount: notificationUnreadCount,
  } = useNotifications();

  const {
    unreadCount: messageUnreadCount,
  } = useMessages();

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

        {/* Logo */}
        <a href="/" className="navbar__logo">
          <span className="navbar__logo-mark">
            T
          </span>

          <span className="navbar__logo-text">
            TechWitter
          </span>
        </a>

        {/* User Search */}
        <div className="navbar__search">
          <UserSearch />
        </div>

        {/* Actions */}
        <div className="navbar__actions">

          {/* Notifications */}
          <div className="navbar__notification">
            <button
              type="button"
              className="navbar__icon-button"
              onClick={() =>
                setShowNotifications(
                  (current) => !current,
                )
              }
              aria-label={`Notifications${
                notificationUnreadCount > 0
                  ? `, ${notificationUnreadCount} unread`
                  : ""
              }`}
              aria-expanded={showNotifications}
            >
              <Bell size={20} />

              {notificationUnreadCount > 0 && (
                <span className="navbar__notification-badge">
                  {notificationUnreadCount > 99
                    ? "99+"
                    : notificationUnreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <NotificationPanel
                onClose={() =>
                  setShowNotifications(false)
                }
              />
            )}
          </div>

          {/* Messages */}
          <button
            type="button"
            className="navbar__icon-button"
            onClick={() => navigate("/messages")}
            aria-label={`Messages${
              messageUnreadCount > 0
                ? `, ${messageUnreadCount} unread`
                : ""
            }`}
          >
            <Mail size={20} />

            {messageUnreadCount > 0 && (
              <span className="navbar__message-badge">
                {messageUnreadCount > 99
                  ? "99+"
                  : messageUnreadCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            className="navbar__avatar"
            type="button"
            aria-label="Open profile"
            onClick={() => {
              setShowNotifications(false);
              navigate("/profile");
            }}
          >
            {user?.displayName
              ?.charAt(0)
              .toUpperCase() || "U"}
          </button>

          {/* Logout */}
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
