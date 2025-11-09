"use client";
import { useEffect, useState, useCallback } from "react";
import { Activity, Clock, User, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Define proper types
interface ActivityUser {
  id: string;
  name?: string | null;
  email?: string | null;
}

interface ProjectActivity {
  id: string;
  message: string;
  type: string;
  createdAt: string;
  user?: ActivityUser | null;
}

export default function ActivityFeed({ projectId }: { projectId: string }) {
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/activities?projectId=${projectId}`);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

      const data: ProjectActivity[] = await res.json();
      if (Array.isArray(data)) {
        setActivities(data);
      } else {
        console.error("Expected array, got:", data);
        setError("Invalid response format");
        setActivities([]);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load activities"
      );
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  return (
    <div className="bg-white dark:bg-transparent rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 px-6 py-4">
        <div className="flex items-center gap-3">
          <Activity size={20} className="text-white dark:text-gray-100" />
          <h2 className="text-lg font-bold text-white dark:text-gray-100 tracking-tight">
            Activity Feed
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Loading activities...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-md p-4">
            <AlertCircle
              size={20}
              className="text-gray-600 dark:text-gray-300 flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Error Loading Activities
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && activities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Activity
                size={32}
                className="text-gray-400 dark:text-gray-500"
              />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              No Activities Yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Activity will appear here as your team works
            </p>
          </div>
        )}

        {/* Activity List */}
        {!loading && !error && activities.length > 0 && (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
            <AnimatePresence initial={false}>
              {activities.map((activity, index) => (
                <motion.div
                  key={`${activity.id}-${activity.createdAt}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-600 dark:from-gray-700 dark:to-gray-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white dark:text-gray-100">
                        {activity.user?.name ? (
                          getInitials(activity.user.name)
                        ) : (
                          <User size={16} />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                          <span className="font-bold">
                            {activity.user?.name || "Someone"}
                          </span>{" "}
                          <span className="text-gray-700 dark:text-gray-300">
                            {activity.message}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 flex-shrink-0">
                        <Clock size={12} />
                        <span className="text-xs font-medium">
                          {formatTime(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
