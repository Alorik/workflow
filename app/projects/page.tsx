"use client";

import { useState, useEffect } from "react";
import {
  FolderKanban,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Folder,
  AlertCircle,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
}

export default function ProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch Projects
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data: Project[] = await res.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      alert("Failed to load projects");
    }
  };

  // ✅ Create Project
  const createProject = async () => {
    if (!name.trim()) return alert("Please enter a project name");

    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) throw new Error("Failed to create project");

      const newProject: Project = await res.json();
      setProjects((prev) => [...prev, newProject]);
      setName("");
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update Project
  const updateProject = async (id: string) => {
    if (!editName.trim()) return alert("Please enter a name");

    try {
      const res = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editName.trim() }),
      });

      if (!res.ok) throw new Error("Failed to update project");

      const updated: Project = await res.json();
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setEditingId(null);
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project");
    }
  };

  // ✅ Delete Project
  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;

    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");

      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project");
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-2xl shadow-lg shadow-indigo-500/30">
            <FolderKanban className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 dark:from-gray-100 dark:via-gray-300 dark:to-white bg-clip-text text-transparent">
              Projects
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage and organize your workspace projects efficiently.
            </p>
          </div>
        </header>

        {/* Create Project */}
        <section className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Create New Project
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createProject()}
              placeholder="Enter project name..."
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition-colors"
            />
            <button
              onClick={createProject}
              disabled={loading || !name.trim()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-700 text-white font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create
                </>
              )}
            </button>
          </div>
        </section>

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center shadow-inner">
            <div className="max-w-md mx-auto">
              <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                No Projects Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get started by creating your first project above.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Folder className="w-5 h-5 dark:text-gray-300" />
              Your Projects ({projects.length})
            </h2>

            {projects.map((project) => (
              <div
                key={project.id}
                className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-md hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300"
              >
                {editingId === project.id ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex-1 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
                        <Edit2 className="w-4 h-4 text-white" />
                      </div>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && updateProject(project.id)
                        }
                        className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none transition-colors"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateProject(project.id)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-lg shadow-md shadow-indigo-500/30">
                        <Folder className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {project.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Project ID: {project.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => {
                          setEditingId(project.id);
                          setEditName(project.name);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-lg shadow-yellow-500/30 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-lg shadow-red-500/30 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
