"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import CursorTracer from "@/components/CursorTracer";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex bg-white dark:bg-white">
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-150 via-gray to-gray-350 px-4">
        <div className="bg-white shadow-[10_4px_15px_rgba(90,71,71,1)] p-8 hover:scale-102 transition-all duration-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Workflow
            </h1>
            <p className="text-gray-600">Sign in to continue to your account</p>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              className="w-full h-12 bg-white cursor-pointer hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 font-medium transition-all duration-200 flex items-center justify-center gap-3 rounded-md px-4"
              placeholder="Email"
            />
            <input
              type="password"
              className="w-full h-12 bg-white cursor-pointer hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 font-medium transition-all duration-200 flex items-center justify-center gap-3 rounded-md px-4"
              placeholder="Password"
            />

            <Button
              type="button"
              onClick={async () => {
                console.log("Sign in button clicked");
                const email = document.querySelector<HTMLInputElement>(
                  'input[placeholder="Email"]'
                )?.value;
                const password = document.querySelector<HTMLInputElement>(
                  'input[placeholder="Password"]'
                )?.value;

                if (!email || !password) {
                  alert("Please enter both email and password");
                  return;
                }

                try {
                  const result = await signIn("credentials", {
                    redirect: false,
                    email,
                    password,
                    callbackUrl: "/dashboard",
                  });

                  if (result?.error) {
                    alert(result.error || "Invalid credentials");
                  } else if (result?.ok) {
                    window.location.href = result.url || "/dashboard";
                  }
                } catch (err) {
                  console.error("Sign-in failed:", err);
                  alert("Something went wrong. Check console for details.");
                }
              }}
              className="w-full h-12 px-3 bg-white cursor-pointer hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 font-medium transition-all duration-200 flex items-center justify-center gap-3"
              variant="outline"
            >
              Sign in
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            <Button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full h-12 bg-white cursor-pointer hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 font-medium transition-all duration-200 flex items-center justify-center gap-3"
              variant="outline"
            >
              <FcGoogle />
              Continue with Google
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            By signing in, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
          <p className="text-center text-sm text-gray-600 mt-6">
            Don&apos;t have an account?
            <button
              onClick={() => router.push("/signup")}
              className="text-blue-600 font-medium hover:underline mx-1"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>

      <div className="w-px bg-gray-300"></div>

      <div className="w-1/2 bg-gradient-to-br from-gray-150 via-gray to-gray-350 flex items-center justify-center">
        <CursorTracer />
      </div>
    </div>
  );
}
