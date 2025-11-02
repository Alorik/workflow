"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Logo from "./Logo";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";


export default function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleAuthAction = () => {
    if (session) {
      signOut();
    } else {
      router.push("/signin");
    }
  };
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-transparent ">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <Logo />
          </Link>
          <motion.button
            whileTap={{ scale: 0.9 }} 
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-gradient-to-r from-gray-300 to-gray-900 text-white px-6 py-2 rounded-lg font-medium shadow-md"
            onClick={handleAuthAction}
          >
            {status === "loading" ? "..." : session ? "Logout" : "Login"}
          </motion.button>
        </div>
      </div>
    </nav>
  );
}
