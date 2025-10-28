"use client";

import { use, useState, useEffect } from "react";
import TaskCard from "@/components/TaskCard";

export default function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Unwrap params using React.use()
  const { id: projectId } = use(params);

  const [tasks, setTasks] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const fetchTasks = async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/tasks?projectId=${projectId}`);
      const data = await res.json();
      if (Array.isArray(data)) setTasks(data);
      else setTasks([]);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  // ➕ Create a new task
  async function handleCreateTask() {
    if (!title.trim() || !projectId) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, projectId }),
      });

      if (res.ok) {
        const newTask = await res.json();
        setTasks((prev) => [newTask, ...prev]); // instant UI update
        setShowModal(false);
        setTitle("");
        setDescription("");
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
