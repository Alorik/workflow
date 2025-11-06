"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  // Initialize theme from localStorage (so it remembers user’s choice)
useEffect(() => {
  if (typeof window !== "undefined") {
    if (localStorage.theme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode((prev) => {
        if (!prev) return true;
        return prev;
      });
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
}, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="absolute top-4 right-4 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 transition-colors duration-300"
    >
      {darkMode ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
