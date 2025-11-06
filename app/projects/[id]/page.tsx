"use client";

import { use, useState, useEffect } from "react";
import TaskCard from "@/components/TaskCard";
import { pusherClient } from "@/lib/pusherClient";
import ActivityFeed from "@/components/ActivityFeed";

export default function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);

  const [tasks, setTasks] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState("newest");
  const [users, setUsers] = useState([]);
  const [assignedToId, setAssignedToId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("");

  const fetchTasks = async () => {
    if (!projectId) return;

    const params = new URLSearchParams({ projectId });
    if (filter !== "all") params.append("status", filter);
    if (sort !== "newest") params.append("sort", sort);

    try {
      const res = await fetch(`/api/tasks?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setTasks(data);
      else setTasks([]);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setTasks([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    if (!projectId) return;

    const channel = pusherClient.subscribe(`project-${projectId}`);

    channel.bind("task-created", (newTask: any) => {
      setTasks((prev) => [newTask, ...prev]);
    });

    channel.bind("task-updated", (updatedTask: any) => {
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
  }, [projectId, filter, sort]);

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

      if (res.ok) {
        const newTask = await res.json();
        setTasks((prev) => [newTask, ...prev]);
        setShowModal(false);
        setTitle("");
        setDescription("");
        setAssignedToId("");
        setDueDate("");
      } else {
        alert("Failed to create task. Please try again.");
      }
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Something went wrong. Try again.");
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
      {/* Animated Background Elements */}
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-700 from-25% via-pink-300 to-gray-800 to-90% bg-clip-text text-transparent mb-2">
                Project Tasks
              </h1>
              <p className="text-gray-900/60 text-sm">
                Manage and track your workflow
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="group relative px-6 py-3 bg-gradient-to-r from-gray-500 from-10% to-emerald-800 to-85% rounded-xl font-medium text-white shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-500/60 transition-all duration-300 hover:scale-105"
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
          <div className="relative group">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none bg-white/10 backdrop-blur-xl border-2 border-purple-200 rounded-xl  px-6 py-3 pr-12 text-gray-600 font-medium 
            ring-purple-300
              focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-2 transition-all cursor-pointer hover:bg-emerald-50"
            >
              <option value="all" className="bg-slate-800">
                All Tasks
              </option>
              <option value="todo" className="bg-slate-800">
                To Do
              </option>
              <option value="in_progress" className="bg-slate-800">
                In Progress
              </option>
              <option value="done" className="bg-slate-800">
                Done
              </option>
            </select>
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none group-hover:text-gray-900 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          <div className="relative group">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none bg-white/10 backdrop-blur-xl border-2 border-purple-200 rounded-xl  px-6 py-3 pr-12 text-gray-600 font-medium 
            ring-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-2 transition-all cursor-pointer hover:bg-emerald-50"
            >
              <option value="newest" className="bg-slate-800">
                Newest First
              </option>
              <option value="oldest" className="bg-slate-800">
                Oldest First
              </option>
              <option value="due" className="bg-slate-800">
                Due Soon
              </option>
            </select>
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300 pointer-events-none group-hover:text-pink-300 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {tasks.length === 0 ? (
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-12 border border-white/10 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-gray-900"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <p className="text-gray-900/60 text-lg">No tasks found</p>
                <p className="text-gray-900/40 text-sm mt-2">
                  Create your first task to get started
                </p>
              </div>
            ) : (
              tasks.map((task: any) => (
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
        <div className="fixed inset-0 flex items-center justify-center bg-gray/60 backdrop-blur-md z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-transparent backdrop-blur-2xl rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300 hover:shadow-cyan-900">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 from-25% via-pink-300 to-gray-900 to-65% bg-clip-text text-transparent">
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

            <div className="space-y-5">
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-2">
                  Task Title
                </label>
                <input
                  className="w-full bg-white border border-white/10 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all"
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
                  className="w-full bg-white border border-white/10 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all resize-none h-28"
                  placeholder="Add details about this task..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-2">
                    Assigned To
                  </label>
                  <select
                    value={assignedToId || ""}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full bg-white border border-white/10 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="" className="bg-slate-800">
                      Unassigned
                    </option>
                    {users.map((user: any) => (
                      <option
                        key={user.id}
                        value={user.id}
                        className="bg-slate-800"
                      >
                        {user.name || user.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-gray-100 border hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-all duration-200 hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600  rounded-xl font-medium text-white shadow-lg shadow-gray-500/30 hover:shadow-xl hover:shadow-emerald-900/40 transition-all duration-200 hover:scale-105"
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
