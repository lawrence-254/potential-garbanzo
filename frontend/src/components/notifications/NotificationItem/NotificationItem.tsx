import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
} from "lucide-react";

import type { Notification } from "../../../services/api/notficationApi";

import "./NotificationItem.css";

interface NotificationItemProps {
  notification: Notification;
  onRead: (notificationId: string) => void;
}

function getNotificationIcon(
  type: Notification["type"],
) {
  switch (type) {
    case "FOLLOW":
      return <UserPlus size={18} />;

    case "LIKE":
      return <Heart size={18} />;

    case "COMMENT":
      return <MessageCircle size={18} />;

    default:
      return <Bell size={18} />;
  }
}

export default function NotificationItem({
  notification,
  onRead,
}: NotificationItemProps) {
  return (
    <button
      type="button"
      className={`notification-item ${
        notification.read
          ? ""
          : "notification-item--unread"
      }`}
      onClick={() => {
        if (!notification.read) {
          onRead(notification.id);
        }
      }}
    >
      <div className="notification-item__icon">
        {getNotificationIcon(notification.type)}
      </div>

      <div className="notification-item__avatar">
        {notification.actor.avatar ? (
          <img
            src={notification.actor.avatar}
            alt={notification.actor.displayName}
          />
        ) : (
          notification.actor.displayName
            .charAt(0)
            .toUpperCase()
        )}
      </div>

      <div className="notification-item__content">
        <p>
          <strong>
            {notification.actor.displayName}
          </strong>{" "}
          {notification.message}
        </p>

        <span>
          {new Date(
            notification.createdAt,
          ).toLocaleString()}
        </span>
      </div>

      {!notification.read && (
        <span
          className="notification-item__dot"
          aria-label="Unread"
        />
      )}
    </button>
  );
}