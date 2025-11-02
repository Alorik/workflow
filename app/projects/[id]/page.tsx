"use client";

import { use, useState, useEffect } from "react";
import TaskCard from "@/components/TaskCard";
import { pusherClient } from "@/lib/pusherClient";

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
        console.log("📋 Fetched tasks:", data);
        console.log("📋 First task assignedTo:", data[0]?.assignedTo);
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
          console.log("👥 Fetched users:", data);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
  
 useEffect(() => {
   if (!projectId) return;

   // Subscribe to the project-specific channel
   const channel = pusherClient.subscribe(`project-${projectId}`);

   // Listen for new task events
   channel.bind("task-created", (newTask: any) => {
     console.log("🟢 Real-time task received:", newTask);
     setTasks((prev) => [newTask, ...prev]);
   });

   // Cleanup on unmount
   return () => {
     pusherClient.unsubscribe(`project-${projectId}`);
   };
 }, [projectId]);
  
  
  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [projectId, filter, sort]);

  // ➕ Create a new task
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
        setTasks((prev) => [newTask, ...prev]); // instant UI update
        setShowModal(false);
        setTitle("");
        setDescription("");
        setAssignedToId(""); 
      } else {
        alert("Failed to create task. Please try again.");
      }
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Something went wrong. Try again.");
    }
  }

  if (!projectId) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Project Tasks</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + New Task
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded p-2 text-sm"
        >
          <option value="all">All</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border rounded p-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="due">Due Soon</option>
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-gray-500">No tasks found</p>
        ) : (
          tasks.map((task: any) => (
            <TaskCard key={task.id} task={task} onUpdated={fetchTasks} />
          ))
        )}
      </div>

      {/* Modal for creating a task */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Create Task</h2>

            <input
              className="w-full border rounded p-2 mb-3"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <textarea
              className="w-full border rounded p-2 mb-4"
              placeholder="Task description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* Assigned To Dropdown */}
            <div className="flex justify-between items-center mb-4">
              <label className="font-medium text-sm">Assigned To:</label>
              <select
                value={assignedToId || ""}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="border rounded p-1 text-sm"
              >
                <option value="">Unassigned</option>
                {users.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>
            {/* Due Date Input */}
            <div className="flex justify-between items-center mb-4">
              <label className="font-medium text-sm">Due Date:</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border rounded p-1 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
