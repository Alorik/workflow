"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      setMessage("Please enter a new password");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setMessage(data.error || "Invalid token");
        return;
      }
      setMessage("Password updated! Redirecting...");
      setTimeout(() => {
        router.push("/signin");
      }, 1500);
    } catch (error) {
      setLoading(false);
      console.log(error);
      setMessage("Something went wrong");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="dark:bg-transparent shadow-lg rounded-xl p-6 w-full max-w-md">
        <h1 className="text-xl dark:text-gray-300 font-bold text-center mb-4">
          Reset Password
        </h1>
        {!token ? (
          <p className="text-red-500 text-center">
            Invalid or missing reset token.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="New Password"
              className="w-full px-4 py-2 border rounded-lg"
            />
            {message && (
              <p className="text-center text-sm text-red-600">{message}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-black dark:from-pink-500 dark:to-gray-700 text-white font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
