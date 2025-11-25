"use client";

import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setMessage(data.message || "Check your email if account exists.");
  }

  return (
    <div className="mt-10">
      <div className="min-h-[100vh] border border-gray-850 rounded-lg flex items-center justify-center">
        <div className="min-h-[60vh] border border-gray-700 rounded-lg w-full max-w-lg flex flex-col justify-center items-center p-8">
          <h1 className="text-xl font-bold my-4">Forgot Password</h1> <br />
          <form
            onSubmit={handleSubmit}
            className="space-y-4 w-full flex flex-col items-center"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border rounded-md p-2"
              required
            />

            <button
              type="submit"
              className="w-100px px-6 py-3 bg-gradient-to-r from-gray-600 to-black dark:from-pink-500 dark:to-gray-700 text-white font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Send Reset Link
            </button>
          </form>
          {message && (
            <p className="text-sm text-green-600 mt-3 text-center">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
