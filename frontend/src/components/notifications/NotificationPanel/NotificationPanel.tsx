import { CheckCheck, X } from "lucide-react";

import { useNotifications } from "../../../context/NotiificationContext/NotificationContext";

import NotificationItem from "../NotificationItem/NotificationItem";

import "./NotifcationPanel.css";

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({
  onClose,
}: NotificationPanelProps) {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  return (
    <div className="notification-panel">
      <div className="notification-panel__header">
        <div>
          <h2>Notifications</h2>

          {unreadCount > 0 && (
            <span>
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="notification-panel__actions">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              aria-label="Mark all notifications as read"
              title="Mark all as read"
            >
              <CheckCheck size={18} />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="notification-panel__body">
        {loading && (
          <div className="notification-panel__status">
            Loading notifications...
          </div>
        )}

        {!loading &&
          notifications.length === 0 && (
            <div className="notification-panel__empty">
              <h3>No notifications yet</h3>

              <p>
                When someone follows, likes, or
                comments on your posts, you'll see
                it here.
              </p>
            </div>
          )}

        {!loading &&
          notifications.length > 0 && (
            <div>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                />
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
