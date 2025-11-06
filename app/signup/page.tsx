"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";

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
      console.error(err);
      setError("Server error, try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-50 to-purple-50 px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6 backdrop-blur-sm bg-white/90 hover:shadow-3xl transition-all duration-300">
            {/* Header */}
            <div className="text-center space-y-2">

              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-gray-600 bg-clip-text text-transparent">
                Join Workflow
              </h1>
              <p className="text-gray-600 text-sm">
                Create your account and start building amazing projects
              </p>
            </div>

            {/* Google Sign Up */}
            <Button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 font-medium transition-all duration-200 flex items-center justify-center gap-3 rounded-xl shadow-sm"
              variant="outline"
            >
              <FcGoogle className="text-xl" />
              Sign up with Google
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-12 border-2 border-gray-200 rounded-xl px-4 hover:border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-100 outline-none transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-12 border-2 border-gray-200 rounded-xl px-4 hover:border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-100 outline-none transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full h-12 border-2 border-gray-200 rounded-xl px-4 hover:border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-100 outline-none transition-all duration-200"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 ml-1">
                  Must be at least 6 characters
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-gray-600 to-gray-600 hover:from-gray-700 hover:to-gray-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              By signing up, you agree to our{" "}
              <a
                href="#"
                className="text-gray-600 hover:text-gray-700 font-medium"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-gray-600 hover:text-gray-700 font-medium"
              >
                Privacy Policy
              </a>
            </p>

            {/* Sign In Link */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => router.push("/signin")}
                  className="text-gray-600 font-semibold hover:text-gray-700 hover:underline transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center space-y-3">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Secure & encrypted
              </div>
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                Free forever
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Animated Geometric Patterns */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-100 to-gray-300 items-center justify-center p-12 relative overflow-hidden ">
        {/* Animated Geometric Shapes */}
        <div className="absolute inset-0">
          {/* Circle 1 */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 border-4 border-gray-500 rounded-full animate-pulse"></div>

          {/* Circle 2 */}
          <div
            className="absolute bottom-1/3 right-1/4 w-40 h-40 border-4 border-gray-500 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>

          {/* Square 1 */}
          <div
            className="absolute top-1/3 right-1/3 w-24 h-24 border-4 border-gray-500  rotate-45 animate-spin"
            style={{ animationDuration: "20s" }}
          ></div>

          {/* Triangle */}
          <div
            className="absolute bottom-1/4 left-1/3 w-0 h-0 border-l-[40px] border-r-[40px] border-b-[70px] border-l-transparent border-r-transparent border-gray-500  animate-bounce"
            style={{ animationDuration: "3s" }}
          ></div>

          {/* Floating dots */}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gray-900 rounded-full animate-ping"></div>
          <div className="absolute top-3/2 left-1/2 w-3 h-3 bg-gray-900 rounded-full animate-ping"></div>
          <div className="absolute top-5/2 left-1/2 w-3 h-3 bg-gray-900 rounded-full animate-ping"></div>
          <div
            className="absolute top-2/3 left-1/5 w-2 h-2 bg-gray-900 rounded-full animate-ping"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute top-1/5 right-1/5 w-2 h-2 bg-gray-900 rounded-full animate-ping"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 text-center text-gray-600 space-y-6">
          <h2 className="text-5xl font-bold">
            Welcome to
            <br />
            Workflow
          </h2>
          <p className="text-xl text-gray-500">Where ideas come to life</p>
        </div>
      </div>
    </div>
  );
}
