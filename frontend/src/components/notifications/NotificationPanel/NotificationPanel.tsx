import { CheckCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
} from "../../../services/api/notficationApi";

import NotificationItem from "../NotificationItem/NotificationItem";

import "./NotificationPanel.css";

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({
  onClose,
}: NotificationPanelProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getNotifications();

        setNotifications(data);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load notifications",
        );
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const handleRead = async (
    notificationId: string,
  ) => {
    try {
      await markNotificationAsRead(notificationId);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                read: true,
              }
            : notification,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error,
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        })),
      );
    } catch (error) {
      console.error(
        "Failed to mark notifications as read:",
        error,
      );
    }
  };

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
              onClick={handleMarkAllAsRead}
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

        {!loading && error && (
          <div className="notification-panel__status notification-panel__status--error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
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
          !error &&
          notifications.length > 0 && (
            <div>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={handleRead}
                />
              ))}
            </div>
          )}
      </div>
    </div>
  );
}