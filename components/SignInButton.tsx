
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function SignInButton() {
  return (
    <motion.div
      whileHover={{ scale: 1.07, rotate: 0.7 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link
        href="/signin"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-lg font-semibold text-gray-600
    bg-white border border-blue-200 rounded-xl
    shadow-[0_4px_15px_rgba(59,130,246,0.15)]
    hover:shadow-[0_6px_20px_rgba(59,130,246,0.25)]
    hover:border-purple-400 hover:bg-blue-50
    transition-all duration-300"
      >
        Sign In
      </Link>
    </motion.div>
  );
}
