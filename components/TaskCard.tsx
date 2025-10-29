"use client";
import { useState } from "react";

const statusColors = {
  todo: "bg-gray-200 text-gray-700",
  in_progress: "bg-yellow-200 text-yellow-700",
  done: "bg-green-200 text-green-700",
};

type Status = "todo" | "in_progress" | "done";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    dueDate?: string | null; // ✅ added this
  };
  onUpdated?: () => void;
}

export default function TaskCard({ task, onUpdated }: TaskCardProps) {
  const [status, setStatus] = useState(task.status);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [dueDate, setDueDate] = useState(task.dueDate || "");

  // ✅ Update only status (from dropdown)
  async function updateStatus(newStatus: string) {
    setStatus(newStatus);
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    onUpdated?.();
  }

  // ✅ Edit entire task (title, desc, dueDate, status)
  async function handleUpdate() {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, status, dueDate }), // include dueDate
    });
    setIsEditing(false);
    onUpdated?.();
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow flex justify-between items-center">
      {/* ---------- Left: Task Info ---------- */}
      <div>
        <h3 className="font-semibold">{task.title}</h3>
        <p className="text-sm text-gray-500">{task.description}</p>
        {task.assignedTo && (
          <p className="text-xs text-gray-500">
            Assigned to: {task.assignedTo.name || task.assignedTo.email}
          </p>
        )}

        {task.dueDate && (
          <p className="text-xs text-gray-400 mt-1">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* ---------- Right: Status + Edit ---------- */}
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => updateStatus(e.target.value)}
          className={`text-xs font-medium px-3 py-1 rounded-full ${
            statusColors[status as Status]
          } cursor-pointer`}
        >
          <option value="todo">🕓 To Do</option>
          <option value="in_progress">⚙️ In Progress</option>
          <option value="done">✅ Done</option>
        </select>

        <button
          onClick={() => setIsEditing(true)}
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
        >
          Edit
        </button>
      </div>

      {/* ---------- Edit Modal ---------- */}
      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Edit Task</h2>

            <input
              className="w-full border rounded p-2 mb-3"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="w-full border rounded p-2 mb-4"
              placeholder="Task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* ✅ Due Date input (only in modal) */}
            <div className="flex justify-between items-center mb-4">
              <label className="font-medium text-sm">Due Date:</label>
              <input
                type="date"
                value={
                  dueDate ? new Date(dueDate).toISOString().split("T")[0] : ""
                }
                onChange={(e) => setDueDate(e.target.value)}
                className="border rounded p-1 text-sm"
              />
            </div>

            <div className="flex justify-between items-center mb-4">
              <label className="font-medium text-sm">Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border rounded p-1 text-sm"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-1 bg-blue-600 text-white rounded"
              >
                Update
              </button>
              <button
                onClick={async () => {
                  await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
                  onUpdated?.(); // refresh parent
                  setIsEditing(false);
                }}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
