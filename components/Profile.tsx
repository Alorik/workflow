"use client";

import { useSession } from "next-auth/react";
import { Sparkles, Calendar, Clock } from "lucide-react";

export default function Profilepage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Please sign in</div>;
  }

    const currentDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div className="mb-8">
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-emerald-200 via-primary-400 to-70% rounded-3xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">

        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-100 to-purple-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-100 to-teal-100 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          {/* icon */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-gray-600 via-cyan-600 to-80% rounded-2xl shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                  Welcome back, {session?.user?.name || "User"}!
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Great to see you again. Ready to be productive?
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-gray-700">
                {currentDate}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-gray-700">
                {currentTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
