import { pusherClient } from "@/lib/pusherClient";
import { useState, useEffect, useRef } from "react";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  link?: string;
}

export default function Notifications({ userId }: { userId?: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Fetch notifications from backend
  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setNotifications(data || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    }
  }

  // ✅ Mark a single notification as read
  async function markAsRead(notificationId: string) {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }

  // ✅ Mark ALL notifications as read when dropdown opens
  async function markAllAsRead() {
    try {
      const unread = notifications.filter((n) => !n.read);
      if (unread.length === 0) return;

      await Promise.all(
        unread.map((n) =>
          fetch(`/api/notifications/${n.id}/read`, { method: "PATCH" })
        )
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }

  // ✅ Handle bell click
  function toggleDropdown() {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (!isOpen) markAllAsRead(); // When opening dropdown, mark all as read
  }

  // ✅ Subscribe to Pusher (for real-time notifications)
  useEffect(() => {
    fetchNotifications();

    if (userId) {
      const channel = pusherClient.subscribe(`user-${userId}`);
      channel.bind("notification", (newNotification: Notification) => {
        setNotifications((prev) => [newNotification, ...prev]);
      });

      return () => {
        pusherClient.unsubscribe(`user-${userId}`);
      };
    }
  }, [userId]);

  // ✅ Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative text-2xl hover:opacity-80 transition-opacity"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white shadow-lg rounded-xl p-3 z-50 max-h-96 overflow-y-auto border border-gray-200">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              No notifications
            </p>
          ) : (
            <div className="space-y-1">
              {notifications.map((n) => (
                <a
                  key={n.id}
                  href={n.link || "#"}
                  onClick={() => markAsRead(n.id)}
                  className={`block p-3 text-sm rounded-md transition-colors ${
                    n.read
                      ? "text-gray-600 bg-gray-50 hover:bg-gray-100"
                      : "text-gray-900 bg-blue-50 hover:bg-blue-100 font-medium"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && (
                      <span className="h-2 w-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    )}
                    <span className="flex-1">{n.message}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
