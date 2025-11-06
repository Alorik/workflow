"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, MoreVertical, User } from "lucide-react";

const statusConfig = {
  todo: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-300",
    dot: "bg-gray-400",
  },
  in_progress: {
    bg: "bg-gray-800",
    text: "text-white",
    border: "border-gray-800",
    dot: "bg-gray-600",
  },
  done: {
    bg: "bg-black",
    text: "text-white",
    border: "border-black",
    dot: "bg-gray-900",
  },
};

type Status = "todo" | "in_progress" | "done";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author?: {
    name: string;
  };
}

export default function TaskCard({ task, onUpdated }: any) {
  const [status, setStatus] = useState<Status>(task.status);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Fetch comments when component mounts
  useEffect(() => {
    fetchComments();
  }, [task.id]);

  async function fetchComments() {
    try {
      setIsLoadingComments(true);
      const res = await fetch(`/api/comments?taskId=${task.id}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  }

  async function updateStatus(newStatus: string) {
    setStatus(newStatus as Status);
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
      body: JSON.stringify({ title, description }),
    });
    setIsEditing(false);
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
        const newComment = await res.json();
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
      {/* Card */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="group relative bg-white rounded-lg border-2 border-gray-200 hover:border-gray-900 overflow-hidden transition-all duration-300"
      >
        {/* Animated border accent on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-700 to-gray-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl text-gray-900 mb-2 leading-tight tracking-tight">
                {title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {description || "No description provided"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${config.dot} flex-shrink-0`}
              ></div>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <MoreVertical size={18} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <select
              value={status}
              onChange={(e) => updateStatus(e.target.value)}
              className={`${config.bg} ${config.text} ${config.border} border-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest cursor-pointer hover:opacity-90 transition-all`}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-5"></div>

          {/* Comments Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle size={16} className="text-gray-400" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Comments {comments.length > 0 && `(${comments.length})`}
              </span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-3 max-h-[200px] overflow-y-auto">
              {isLoadingComments ? (
                <p className="text-xs text-gray-400">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-xs text-gray-400">No comments yet...</p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={14} className="text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-bold text-gray-900">
                            {comment.author?.name || "User"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-0.5">
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
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isPostingComment) {
                    handlePostComment();
                  }
                }}
                disabled={isPostingComment}
                className="flex-1 bg-white border-2 border-gray-200 focus:border-gray-900 rounded-md px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none transition-colors disabled:opacity-50"
                placeholder="Add a comment..."
              />
              <button
                onClick={handlePostComment}
                disabled={!commentText.trim() || isPostingComment}
                className="bg-black text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="fixed inset-0 flex items-center justify-center bg-gray-900/30 backdrop-blur-md z-50 p-4"
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl border-2 border-gray-200 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header bar */}
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 px-8 py-6">
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
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Task Title
                    </label>
                    <input
                      className="w-full bg-white border-2 border-gray-200 focus:border-gray-900 rounded-md p-3 text-base focus:outline-none transition-colors"
                      placeholder="Enter task title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Description
                    </label>
                    <textarea
                      rows={5}
                      className="w-full bg-white border-2 border-gray-200 focus:border-gray-900 rounded-md p-3 text-base focus:outline-none transition-colors resize-none"
                      placeholder="Add task description..."
                      value={description}

        
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-6 py-2.5 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition-colors"
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
