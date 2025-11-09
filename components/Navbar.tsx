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
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xs border-b border-gray-200/50 dark:border-gray-800/50 transition-colors duration-300">
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
              className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 dark:from-gray-200 dark:via-gray-300 dark:to-gray-100 text-white dark:text-gray-900 px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70 transition-shadow"
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
