"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        alert("✅ Account created successfully!");
        router.push("/signin");
      }
    } catch (err) {
      setError("Server error, try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-150 via-gray to-gray-350 px-4">
        <div className="bg-white shadow-[10_4px_15px_rgba(90,71,71,1)] p-8 hover:scale-102 transition-all duration-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create your Workflow Account
            </h1>
            <p className="text-gray-600">
              Enter details to register a new account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-12 border-2 border-gray-200 rounded-md px-4 hover:border-gray-300 focus:border-blue-500 outline-none"
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full h-12 border-2 border-gray-200 rounded-md px-4 hover:border-gray-300 focus:border-blue-500 outline-none"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full h-12 border-2 border-gray-200 rounded-md px-4 hover:border-gray-300 focus:border-blue-500 outline-none"
              required
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <a
              href="/signin"
              className="text-blue-600 font-medium hover:underline"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>

      <div className="w-px bg-gray-300"></div>

      <div className="w-1/2 bg-gradient-to-br from-gray-150 via-gray to-gray-350 flex items-center justify-center">
        <h2 className="text-4xl font-bold text-gray-800">Join Workflow 🚀</h2>
      </div>
    </div>
  );
}
