"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Logo from "./Logo";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Notifications from "./Notifications";

export default function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();


  const handleAuthAction = async () => {
    if (session) {
      await signOut({ callbackUrl: "/" });
    } else {
      router.push("/signin");
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-lg ">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>

          <div className="flex items-center gap-10">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
              onClick={handleAuthAction}
            >
              {status === "loading" ? "..." : session ? "Logout" : "Login"}
            </motion.button>

            {session?.user?.id && <Notifications userId={session.user.id} />}
          </div>
        </div>
      </div>
    </nav>
  );
}
