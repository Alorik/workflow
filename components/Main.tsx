"use client";

import { useRouter } from "next/navigation";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { motion } from "framer-motion";

export default function HomeHero() {
  const router = useRouter();
  return (
    <section>
      <div className="flex justify-between max-w-9xl mx-auto mt-16 px-4 ">
        {/* Left */}
        <div className="flex flex-col items-start w-1/2">
          <div className="text-6xl font-bold mt-30">
            <span className="block mb-2">Track. Tweak.</span>
            <span className="block">Transform. Thrive.</span>
            <span className="bg-gradient-to-r  block from-[#4FAE91] to-[#6DB8A5] bg-clip-text text-transparent font-bold text-6xl mb-12">
              Together.
            </span>
          </div>

          <div className="text-2xl ">
            Kickstart your journey with
            <span className="font-bold">WorkFlow </span>
          </div>
          <div className="mb-32">
            <motion.button
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex cursor-pointer  mt-12 items-center justify-center gap-2 bg-gradient-to-b from-[#49be9b] to-[#437367] text-2xl text-white px-6 py-2 rounded-xl"
              onClick={() => router.push("/dashboard")}
            >
              <span>Start</span>
              <MdKeyboardDoubleArrowRight className="text-3xl" />
            </motion.button>
          </div>
        </div>

        {/* Right */}
        <div className="backdrop-blur-3xl w-1/2 bg-gradient-to-b via-gray-300 via-indigo-200  to-gray-100">
          

        </div>
      </div>
    </section>
  );
}
