"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, MoreVertical, User } from "lucide-react";

const statusConfig = {
  todo: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-200",
    border: "border-gray-300 dark:border-gray-600",
    dot: "bg-gray-400 dark:bg-gray-500",
  },
  in_progress: {
    bg: "bg-gray-800 dark:bg-gray-700",
    text: "text-white dark:text-gray-100",
    border: "border-gray-800 dark:border-gray-600",
    dot: "bg-gray-600 dark:bg-gray-500",
  },
  done: {
    bg: "bg-black dark:bg-gray-900",
    text: "text-white dark:text-gray-100",
    border: "border-black dark:border-gray-700",
    dot: "bg-gray-900 dark:bg-gray-600",
  },
} as const;

type Status = keyof typeof statusConfig;

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author?: { name: string };
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  projectId: string;
  assignedToId?: string | null;
  dueDate?: string | null;
}

interface TaskCardProps {
  task: Task;
  onUpdated?: () => void;
}

export default function TaskCard({ task, onUpdated }: TaskCardProps) {
  const [status, setStatus] = useState<Status>(task.status);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      setIsLoadingComments(true);
      const res = await fetch(`/api/comments?taskId=${task.id}`);
      if (res.ok) {
        const data: Comment[] = await res.json();
        setComments(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [task.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function updateStatus(newStatus: Status) {
    setStatus(newStatus);
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    onUpdated?.();
  }

  async function handleUpdate() {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    setIsEditing(false);
    onUpdated?.();
  }

  async function handlePostComment() {
    if (!commentText.trim()) return;
    try {
      setIsPostingComment(true);
      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText, taskId: task.id }),
      });
      if (res.ok) {
        const newComment: Comment = await res.json();
        setComments((prev) => [...prev, newComment]);
        setCommentText("");
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsPostingComment(false);
    }
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

  const config = statusConfig[status];

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="group relative bg-white dark:bg-transparent rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-gray-500 overflow-hidden transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-700 to-gray-500 dark:from-gray-600 dark:via-gray-800 dark:to-gray-900 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-2 leading-tight tracking-tight">
                {title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {description || "No description provided"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                <MoreVertical
                  size={18}
                  className="text-gray-400 dark:text-gray-300"
                />
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <select
              value={status}
              onChange={(e) => updateStatus(e.target.value as Status)}
              className={`${config.bg} ${config.text} ${config.border} border-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest cursor-pointer hover:opacity-90 transition-all`}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent mb-5"></div>

          {/* Comments */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle
                size={16}
                className="text-gray-400 dark:text-gray-300"
              />
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Comments {comments.length > 0 && `(${comments.length})`}
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 mb-3 max-h-[200px] overflow-y-auto">
              {isLoadingComments ? (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Loading comments...
                </p>
              ) : comments.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  No comments yet...
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <User
                          size={14}
                          className="text-gray-600 dark:text-gray-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                            {comment.author?.name || "User"}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isPostingComment)
                    handlePostComment();
                }}
                disabled={isPostingComment}
                className="flex-1 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 focus:border-gray-900 dark:focus:border-gray-500 rounded-md px-4 py-2 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none transition-colors disabled:opacity-50"
                placeholder="Add a comment..."
              />
              <button
                onClick={handlePostComment}
                disabled={!commentText.trim() || isPostingComment}
                className="bg-black dark:bg-gray-700 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPostingComment ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-gray-900/30 dark:bg-transparent backdrop-blur-md z-50 p-4"
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative bg-transparent dark:bg-transparent rounded-xl shadow-2xl w-full max-w-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 px-8 py-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Edit Task
                </h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="absolute top-5 right-6 text-white/70 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8">
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-white dark:text-gray-400 uppercase tracking-wider mb-2">
                      Task Title
                    </label>
                    <input
                      className="w-full bg-transparent dark:bg-transparent border-2 border-gray-200 dark:border-gray-700 focus:border-gray-900 dark:focus:border-gray-500 rounded-md p-3 text-base focus:outline-none transition-colors"
                      placeholder="Enter task title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-50 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Description
                    </label>
                    <textarea
                      rows={5}
                      className="w-full bg-transparent dark:bg-transparent border-2 border-gray-200 dark:border-gray-700 focus:border-gray-900 dark:focus:border-gray-500 rounded-md p-3 text-base focus:outline-none transition-colors resize-none"
                      placeholder="Add task description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-6 py-2.5 bg-black dark:bg-gray-700 text-white rounded-md font-semibold hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
