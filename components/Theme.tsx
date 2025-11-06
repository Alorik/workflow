"use client";
import { useState, useEffect } from "react";

export default function Theme() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.theme === "dark";
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <button
      onClick={() => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.theme = newMode ? "dark" : "light";
      }}
    >
      Toggle Theme
    </button>
  );
}
