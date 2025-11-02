"use client";
import { useState, useEffect } from "react";
import { pusherClient } from "@/lib/pusherClient";
import { Task } from "@prisma/client";

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
    dueDate?: string | null;
    assignedTo?: {
      id: string;
      name: string | null;
      email: string | null;
    } | null;
  };
  onUpdated?: () => void;
}

export default function TaskCard({ task, onUpdated }: TaskCardProps) {
  const [status, setStatus] = useState(task.status);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  // Load comments
  useEffect(() => {
    fetch(`/api/comments?taskId=${task.id}`)
      .then((res) => res.json())
      .then(setComments);
  }, [task.id]);

  // 🔔 Subscribe to real-time updates
  useEffect(() => {
    const channel = pusherClient.subscribe("workflow-channel");

    channel.bind("TASK_UPDATED", (updatedTask: Task) => {
      if (updatedTask.id === task.id) {
        setTitle(updatedTask.title);
        setDescription(updatedTask.description || "");
        setStatus(updatedTask.status);
        setDueDate(updatedTask.dueDate || "");
      }
    });

    channel.bind("TASK_DELETED", (deleted: { id: string }) => {
      if (deleted.id === task.id) {
        onUpdated?.();
      }
    });

    channel.bind("COMMENT_ADDED", (comment: any) => {
      if (comment.taskId === task.id) {
        setComments((prev) => [...prev, comment]);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [task.id]);

  async function updateStatus(newStatus: string) {
    setStatus(newStatus);
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  async function handleUpdate() {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, status, dueDate }),
    });
    setIsEditing(false);
  }

  const addComment = async () => {
    if (!newComment.trim()) return;
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment, taskId: task.id }),
    });
    const data = await res.json();
    setComments([...comments, data]);
    setNewComment("");
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow flex justify-between items-center">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>

        {/* Comments */}
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-1">Comments</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto border p-2 rounded-md bg-gray-50">
            {comments.map((comment) => (
              <p key={comment.id} className="text-sm">
                <span className="font-semibold">
                  {comment.author.name || comment.author.email}:
                </span>{" "}
                {comment.content}
              </p>
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            <input
              className="border rounded-md px-2 py-1 text-sm flex-1"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
            />
            <button
              onClick={addComment}
              className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>

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
                  onUpdated?.();
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
