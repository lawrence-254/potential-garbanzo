import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
} from "../..//services/api/notficationApi";

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext =
  createContext<NotificationContextValue | undefined>(
    undefined,
  );

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({
  children,
}: NotificationProviderProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] = useState(true);

 const refreshNotifications = useCallback(async () => {
  try {
    const data = await getNotifications();

    setNotifications(data);
  } catch (error) {
    console.error(
      "Failed to load notifications:",
      error,
    );
  }
}, []);

  const markAsRead = async (
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

  const markAllAsRead = async () => {
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

 useEffect(() => {
  const loadNotifications = async () => {
    setLoading(true);

    await refreshNotifications();

    setLoading(false);
  };

  loadNotifications();
}, [refreshNotifications]);

useEffect(() => {
  const interval = window.setInterval(() => {
    refreshNotifications();
  }, 30_000);

  return () => {
    window.clearInterval(interval);
  };
}, [refreshNotifications]);
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      refreshNotifications();
    }
  };

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange,
  );

  return () => {
    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );
  };
}, [refreshNotifications]);
useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);

      await refreshNotifications();

      setLoading(false);
    };

    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider",
    );
  }

  return context;
}