"use client";


import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Projectpage() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      alert("Failed to load projects");
    }
  };

  const createProject = async () => {
    if (!name.trim()) {
      alert("Please enter a project name");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create project");
      }

      const newProject = await res.json();
      router.push("/dashboard");
      setProjects([...projects, newProject]);
      setName("");
    } catch (error) {
      console.error("Error creating project:", error);
      alert(error.message || "Failed to create project");
    } finally {
      setLoading(false);
    }

  };

  const updateProject = async (id: string) => {
    if (!editName.trim()) {
      alert("Please enter a project name");
      return;
    }

    try {
      const res = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editName.trim() }),
      });

      if (!res.ok) throw new Error("Failed to update project");

      const updated = await res.json();
      setProjects(projects.map((p) => (p.id === id ? updated : p)));
      setEditingId(null);
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project");
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");

      setProjects(projects.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>

      <div className="mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && createProject()}
          placeholder="New project name"
          className="border p-2 rounded mr-2"
        />
        <button
          onClick={createProject}
          disabled={loading || !name.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="text-gray-500">
          No projects yet. Create one to get started!
        </p>
      ) : (
        <ul>
          {projects.map((project: any) => (
            <li
              key={project.id}
              className="border p-2 rounded mb-2 flex justify-between items-center"
            >
              {editingId === project.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && updateProject(project.id)
                    }
                    className="border p-1 rounded mr-2"
                  />
                  <div>
                    <button
                      onClick={() => updateProject(project.id)}
                      className="bg-green-500 text-white px-2 py-1 rounded mr-1"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-400 text-white px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span>{project.name}</span>
                  <div>
                    <button
                      onClick={() => {
                        setEditingId(project.id);
                        setEditName(project.name);
                      }}
                      className="bg-yellow-400 text-white px-2 py-1 rounded mr-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
