"use client";

import { use, useCallback, useState, useEffect } from "react";
import TaskCard from "@/components/TaskCard";
import { pusherClient } from "@/lib/pusherClient";
import ActivityFeed from "@/components/ActivityFeed";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
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

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [projectId, filter, sort, fetchTasks]);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-blue-400 dark:bg-blue-500 rounded-full animate-pulse delay-150"></div>
          <div className="w-3 h-3 bg-emerald-400 dark:bg-emerald-500 rounded-full animate-pulse delay-300"></div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-300 bg-gray-50 dark:bg-transparent">
      <div className="relative z-10 max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl transition-colors">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-700 via-pink-400 to-gray-800 dark:from-gray-200 dark:via-pink-300 dark:to-white bg-clip-text text-transparent mb-2">
                Project Tasks
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Manage and track your workflow seamlessly
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="group relative px-6 py-3 bg-gradient-to-r from-gray-500 to-emerald-700 dark:from-gray-700 dark:to-emerald-600 rounded-xl font-medium text-white shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
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
        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none bg-white/80 dark:bg-gray-900/80 border-2 border-purple-200 dark:border-purple-800 rounded-xl px-6 py-3 text-gray-700 dark:text-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 hover:bg-purple-50/50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <option value="all">All Tasks</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none bg-white/80 dark:bg-gray-900/80 border-2 border-purple-200 dark:border-purple-800 rounded-xl px-6 py-3 text-gray-700 dark:text-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 hover:bg-purple-50/50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
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
              <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl p-12 border border-gray-200 dark:border-gray-800 text-center shadow-inner">
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  No tasks found
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  Create your first task to get started 🚀
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
        <div className="fixed inseat-0 flex items-center justify-center bg-transparent dark:bg-transparent backdrop-blur-md z-50 p-4 transition-all">
          <div className="bg-transparent/95 dark:bg-transparent-900/95 backdrop-blur-2xl rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-pink-400 to-gray-900 dark:from-gray-200 dark:via-pink-300 dark:to-white bg-clip-text text-transparent">
                Create New Task
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all hover:rotate-90 duration-300"
              >
                <svg
                  className="w-5 h-5 text-gray-700 dark:text-gray-300"
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

            <div className="space-y-5">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                  Task Title
                </label>
                <input
                  className="w-full bg-transparent dark:bg-transparent border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 focus:border-transparent transition-all"
                  placeholder="Enter task title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  className="w-full bg-transparent dark:bg-transparent border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 resize-none h-28 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 focus:border-transparent transition-all"
                  placeholder="Add details about this task..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                    Assigned To
                  </label>
                  <select
                    value={assignedToId || ""}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email || "Unnamed User"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 focus:border-transparent transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-700 dark:from-gray-700 dark:to-gray-800 text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-purple-500/20"
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