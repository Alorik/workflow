"use client";

import { useSession } from "next-auth/react";

export default function Profilepage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Please sign in</div>;
  }

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-b from-white to-[#c0e3da] rounded-lg p-6  ">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome back, {session?.user?.name}
        </h1>
        <div className="flex items-center gap-2 text-gray-600"></div>
      </div>
    </div>
  );
}
