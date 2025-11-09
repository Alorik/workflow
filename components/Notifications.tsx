import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt?: string;
}

export default function Notifications({ userId }: { userId?: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications from backend
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

  // Mark a single notification as read
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

  // Mark ALL notifications as read
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

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

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
      {/* Bell Button */}
      <button
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <Bell
          size={22}
          className={`transition-colors ${
            unreadCount > 0
              ? "text-gray-900 dark:text-white"
              : "text-gray-600 dark:text-gray-400"
          }`}
        />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-pink-500 to-rose-500 dark:from-pink-400 dark:to-rose-400 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 shadow-2xl dark:shadow-gray-950/50 rounded-lg border-2 border-gray-200 dark:border-gray-800 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-gray-800 dark:via-gray-900 dark:to-black px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-white" />
                  <h3 className="font-bold text-white tracking-tight">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="bg-white dark:bg-gray-200 text-gray-900 dark:text-black text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/70 hover:text-white transition-colors p-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Mark all as read button */}
            {unreadCount > 0 && (
              <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white uppercase tracking-wider transition-colors"
                >
                  <Check size={14} />
                  Mark all as read
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-5">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Inbox
                      size={32}
                      className="text-gray-400 dark:text-gray-600"
                    />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    All caught up!
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    You have no notifications
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {notifications.map((n, index) => (
                    <motion.a
                      key={n.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      href={n.link || "#"}
                      onClick={(e) => {
                        if (!n.link || n.link === "#") {
                          e.preventDefault();
                        }
                        markAsRead(n.id);
                      }}
                      className={`block px-5 py-4 transition-colors relative ${
                        n.read
                          ? "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          : "bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                      }`}
                    >
                      {/* Unread indicator bar */}
                      {!n.read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-rose-500 dark:from-pink-400 dark:to-rose-400"></div>
                      )}
                      <div className="flex items-start gap-3">
                        {/* Dot indicator */}
                        <div className="flex-shrink-0 mt-1.5">
                          {!n.read ? (
                            <div className="w-2 h-2 bg-pink-500 dark:bg-pink-400 rounded-full shadow-sm"></div>
                          ) : (
                            <div className="w-2 h-2 border-2 border-gray-300 dark:border-gray-700 rounded-full"></div>
                          )}
                        </div>
                        {/* Message */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm leading-relaxed ${
                              n.read
                                ? "text-gray-600 dark:text-gray-400"
                                : "text-gray-900 dark:text-white font-medium"
                            }`}
                          >
                            {n.message}
                          </p>
                          {n.createdAt && (
                            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
