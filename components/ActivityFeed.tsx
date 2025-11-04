
"use client";
import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusherClient";

export default function ActivityFeed({ projectId }: { projectId: string }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchActivities() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/activities?projectId=${projectId}`);

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }

      const data = await res.json();
      console.log("Fetched activities:", data); // Debug log

      // Make sure data is an array
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
  }

  useEffect(() => {
    fetchActivities();

    // ✅ FIXED: Use parentheses for function calls
    const channel = pusherClient.subscribe(`project-${projectId}`);

    channel.bind("activity-created", (newActivity: any) => {
      setActivities((prev) => [newActivity, ...prev]);
    });

    return () => {
      // ✅ FIXED: Use parentheses for function call
      pusherClient.unsubscribe(`project-${projectId}`);
    };
  }, [projectId]);

  return (
    <div className="bg-white rounded-xl p-4 shadow mt-6">
      <h2 className="font-semibold text-lg mb-3">Activity Feed</h2>

      {loading && (
        <div className="text-sm text-gray-500">Loading activities...</div>
      )}

      {error && <div className="text-sm text-red-500">Error: {error}</div>}

      {!loading && !error && activities.length === 0 && (
        <div className="text-sm text-gray-500">No activities yet</div>
      )}

      <div className="space-y-2">
        {activities.map((a) => (
          <div key={`${a.id}-${a.createdAt}`} className="text-sm text-gray-700">
            <span className="font-medium">{a.user?.name || "Someone"}</span>{" "}
            {a.message}
            <span className="text-xs text-gray-400 ml-2">
              {new Date(a.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
