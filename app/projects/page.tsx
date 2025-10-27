"use client";

import { useState, useEffect } from "react";

export default function Projectpage() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  const createProject = async () => {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const newProject = await res.json();
    setProjects([...projects, newProject]);
    setName("");
  };

  const updateProject = async (id: string) => {
    const res = await fetch("api/projects", {
      method: "PUT",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ id, name: editName }),
    });

    const updated = await res.json();
    setProjects(projects.map((p) => (p.id === id ? updated : p)));
    setEditingId(null);
  };

  const deleteProject = async (id: string) => {
    await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
    setProjects(projects.filter((p) => p.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>

      <div className="mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name"
          className="border p-2 rounded mr-2"
        />
        <button
          onClick={createProject}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create
        </button>
      </div>

      {/* projects list */}

      <ul>
        {projects.map((project: any) => (
          <li
            key={project.id}
            className="border p-2 rounded mb-2 flex justify-between items-center"
          >
            {editingId === project.id ? (
              // Edit Mode
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border p-1 rounded mr-2"
                />
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
              </>
            ) : (
              // View Mode
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
    </div>
  );
}
