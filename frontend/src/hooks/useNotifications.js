import { useState, useEffect, useCallback } from "react";
import { useSocketContext } from "../contexts/SocketContext";
import notificationService from "../services/notificationService";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { on } = useSocketContext();

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();

    const off = on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return off;
  }, [on, fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  }, []);

  return { notifications, unreadCount, markAsRead, markAllAsRead };
};
