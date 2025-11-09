"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface ColorBlob {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

export default function InteractiveBackground() {
  const [blobs, setBlobs] = useState<ColorBlob[]>([]);
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();

  // Pages that should NOT show this background (they have their own)
  const excludedPages = ["/", "/home"];
  const shouldShowBackground = !excludedPages.includes(pathname);

  // Check if dark mode is active
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const darkColors = [
    "rgba(251, 113, 133, 0.4)", // pink
    "rgba(249, 115, 22, 0.4)", // orange
    "rgba(236, 72, 153, 0.4)", // rose
    "rgba(251, 146, 60, 0.4)", // orange-400
    "rgba(244, 114, 182, 0.4)", // pink-400
    "rgba(251, 191, 36, 0.4)", // amber
    "rgba(139, 92, 246, 0.4)", // violet
    "rgba(59, 130, 246, 0.4)", // blue
  ];

  const lightColors = [
    "rgba(251, 113, 133, 0.15)", // pink
    "rgba(249, 115, 22, 0.15)", // orange
    "rgba(236, 72, 153, 0.15)", // rose
    "rgba(251, 146, 60, 0.15)", // orange-400
    "rgba(244, 114, 182, 0.15)", // pink-400
    "rgba(251, 191, 36, 0.15)", // amber
    "rgba(139, 92, 246, 0.15)", // violet
    "rgba(59, 130, 246, 0.15)", // blue
  ];

  const colors = isDark ? darkColors : lightColors;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Throttle blob creation - only create if not too many active
    if (blobs.length > 8) return;

    const newBlob: ColorBlob = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 250 + 200,
    };

    setBlobs((prev) => [...prev, newBlob]);

    setTimeout(() => {
      setBlobs((prev) => prev.filter((blob) => blob.id !== newBlob.id));
    }, 2500);
  };

  // Don't render on excluded pages
  if (!shouldShowBackground) return null;

  return (
    <>
      {/* Fixed background layer */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Gradient background base */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-pink-50/30 dark:from-black dark:via-gray-950 dark:to-pink-950/20 transition-colors duration-500" />

        {/* Animated mesh gradient overlay */}
        <motion.div
          className="absolute inset-0 opacity-30 dark:opacity-20"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(251, 113, 133, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(251, 113, 133, 0.1) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Static ambient blobs with motion */}
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-br from-pink-400/20 to-rose-400/20 dark:from-pink-500/15 dark:to-rose-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ top: "20%", left: "20%" }}
        />

        <motion.div
          className="absolute w-[500px] h-[500px] bg-gradient-to-br from-orange-400/20 to-amber-400/20 dark:from-orange-500/15 dark:to-amber-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          style={{ bottom: "15%", right: "15%" }}
        />

        <motion.div
          className="absolute w-80 h-80 bg-gradient-to-br from-violet-400/20 to-purple-400/20 dark:from-violet-500/15 dark:to-purple-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -80, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          style={{ top: "50%", right: "30%" }}
        />

        <motion.div
          className="absolute w-72 h-72 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 dark:from-blue-500/15 dark:to-cyan-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 60, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
          style={{ top: "60%", left: "10%" }}
        />

        {/* Interactive mouse-following blobs with framer motion */}
        <AnimatePresence>
          {blobs.map((blob) => (
            <motion.div
              key={blob.id}
              className="absolute rounded-full blur-3xl"
              initial={{
                x: blob.x - blob.size / 2,
                y: blob.y - blob.size / 2,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                scale: [0, 1.2, 1],
                opacity: [0, 0.8, 0.6],
              }}
              exit={{
                scale: 1.5,
                opacity: 0,
              }}
              transition={{
                duration: 2.5,
                ease: [0.23, 1, 0.32, 1],
              }}
              style={{
                width: blob.size,
                height: blob.size,
                background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
              }}
            />
          ))}
        </AnimatePresence>

        {/* Subtle noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Invisible overlay to catch mouse events */}
      <div
        className="fixed inset-0 pointer-events-none"
        onMouseMove={handleMouseMove}
        style={{ zIndex: 9999 }}
      />
    </>
  );
}