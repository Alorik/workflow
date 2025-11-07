"use client";

import { use, useCallback, useState, useEffect } from "react";
import TaskCard from "@/components/TaskCard";
import { pusherClient } from "@/lib/pusherClient";
import ActivityFeed from "@/components/ActivityFeed";

// ✅ User Type
interface User {
  id: string;
  name?: string | null;
  email?: string | null;
}

// ✅ Task Type
interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done"; // ✅ changed from `string` to union
  projectId: string;
  assignedToId?: string | null;
  dueDate?: string | null;
}

export default function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState("newest");
  const [users, setUsers] = useState<User[]>([]);
  const [assignedToId, setAssignedToId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("");

  // ✅ Fetch Tasks
  const fetchTasks = useCallback(async () => {
    if (!projectId) return;

    const query = new URLSearchParams({ projectId });
    if (filter !== "all") query.append("status", filter);
    if (sort !== "newest") query.append("sort", sort);

    try {
      const res = await fetch(`/api/tasks?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data: Task[] = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setTasks([]);
    }
  }, [projectId, filter, sort]);

  // ✅ Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data: User[] = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    }
  };

  // ✅ Pusher realtime updates
  useEffect(() => {
    if (!projectId) return;

    const channel = pusherClient.subscribe(`project-${projectId}`);

    channel.bind("task-created", (newTask: Task) => {
      setTasks((prev) => [newTask, ...prev]);
    });

    channel.bind("task-updated", (updatedTask: Task) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
    });

    channel.bind("task-deleted", (deletedTaskId: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== deletedTaskId));
    });

    return () => {
      pusherClient.unsubscribe(`project-${projectId}`);
    };
  }, [projectId]);

  // ✅ Fetch initial data
  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [projectId, filter, sort, fetchTasks]);

  // ✅ Create Task
  async function handleCreateTask() {
    if (!title.trim() || !projectId) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          projectId,
          assignedToId: assignedToId || null,
          dueDate: dueDate || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create task");

      const newTask: Task = await res.json();
      setTasks((prev) => [newTask, ...prev]);
      setShowModal(false);
      setTitle("");
      setDescription("");
      setAssignedToId(null);
      setDueDate("");
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Something went wrong. Please try again.");
    }
  }

  if (!projectId)
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-100 via-gray-50 to-neutral-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-150"></div>
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse delay-300"></div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 via-gray-50 to-neutral-100 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-30 h-30 bg-gray-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-30 h-30 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-30 h-30 bg-emerald-300 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8 backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-700 via-pink-300 to-gray-800 bg-clip-text text-transparent mb-2">
                Project Tasks
              </h1>
              <p className="text-gray-900/60 text-sm">
                Manage and track your workflow
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="group relative px-6 py-3 bg-gradient-to-r from-gray-500 to-emerald-800 rounded-xl font-medium text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Task
              </span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          {/* Filter by Status */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none bg-white/10 backdrop-blur-xl border-2 border-purple-200 rounded-xl px-6 py-3 text-gray-600 font-medium focus:outline-none hover:bg-emerald-50"
          >
            <option value="all">All Tasks</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none bg-white/10 backdrop-blur-xl border-2 border-purple-200 rounded-xl px-6 py-3 text-gray-600 font-medium focus:outline-none hover:bg-emerald-50"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="due">Due Soon</option>
          </select>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {tasks.length === 0 ? (
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-12 border border-white/10 text-center">
                <p className="text-gray-900/60 text-lg">No tasks found</p>
                <p className="text-gray-900/40 text-sm mt-2">
                  Create your first task to get started
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard key={task.id} task={task} onUpdated={fetchTasks} />
              ))
            )}
          </div>

          <div className="lg:col-span-1">
            <ActivityFeed projectId={projectId} />
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray/60 backdrop-blur-md z-50 p-4">
          <div className="bg-transparent backdrop-blur-2xl rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-pink-300 to-gray-900 bg-clip-text text-transparent">
                Create New Task
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:rotate-90 duration-300"
              >
                <svg
                  className="w-5 h-5 text-gray-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="space-y-5">
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-2">
                  Task Title
                </label>
                <input
                  className="w-full bg-white border rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-purple-400/50 transition-all"
                  placeholder="Enter task title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  className="w-full bg-white border rounded-xl px-4 py-3 text-gray-700 resize-none h-28 focus:ring-2 focus:ring-purple-400/50"
                  placeholder="Add details about this task..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Assigned To */}
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-2">
                    Assigned To
                  </label>
                  <select
                    value={assignedToId || ""}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full bg-white border rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-purple-400/50 transition-all cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email || "Unnamed User"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white border rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-purple-400/50 transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-gray-100 border rounded-xl text-gray-700 hover:bg-gray-200 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:scale-105 transition-all duration-200"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
