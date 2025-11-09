"use client";

import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { motion } from "framer-motion";
import { CheckCircle2, Users, Target, TrendingUp, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomeHero() {
  const router = useRouter();

  return (
    <div className="overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center">
        {/* REMOVED: Static background - now using InteractiveBackground */}

        <div className="max-w-7xl mx-auto px-4 py-20 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-7xl lg:text-8xl font-black leading-tight">
                  <span className="block text-gray-900 dark:text-white">
                    Track. Tweak.
                  </span>
                  <span className="block text-gray-900 dark:text-white">
                    Transform. Thrive.
                  </span>
                  <span className="block bg-gradient-to-r from-[#4FAE91] via-[#6DB8A5] to-[#5CC9AC] bg-clip-text text-transparent">
                    Together.
                  </span>
                </h1>
              </div>

              <p className="text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Kickstart your journey with{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  WorkFlow
                </span>{" "}
                — the ultimate platform to manage projects, collaborate
                seamlessly, and achieve extraordinary results.
              </p>

              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  className="group flex items-center gap-3 bg-gradient-to-r from-[#49be9b] to-[#437367] text-white px-10 py-5 rounded-2xl text-xl font-bold shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
                  onClick={() => router.push("/dashboard")}
                >
                  <span>Start</span>
                  <MdKeyboardDoubleArrowRight className="text-3xl group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-pink-950/40 rounded-3xl p-12 shadow-2xl border border-white/50 dark:border-white/10 backdrop-blur-xl">
                {/* Floating Cards */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-6 -right-6 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800"
                >
                  <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <p className="text-3xl font-black text-gray-900 dark:text-white">
                    +47%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Productivity
                  </p>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800"
                >
                  <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-2" />
                  <p className="text-3xl font-black text-gray-900 dark:text-white">
                    50K+
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Active Teams
                  </p>
                </motion.div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-white/50 dark:bg-gray-900/50 backdrop-blur rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          Website Redesign
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Due in 3 days
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl">✨</div>
                  </div>

                  <div className="flex items-center justify-between bg-white/50 dark:bg-gray-900/50 backdrop-blur rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          Marketing Campaign
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          In progress
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl">🚀</div>
                  </div>

                  <div className="flex items-center justify-between bg-white/50 dark:bg-gray-900/50 backdrop-blur rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <Rocket className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          Product Launch
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Planning phase
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl">💡</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
