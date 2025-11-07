"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";

interface MousePosition {
  x: number;
  y: number;
}

interface Trail {
  id: number;
  x: number;
  y: number;
}

interface EyeOffset {
  x: number;
  y: number;
}

interface EyePositions {
  [key: string]: EyeOffset;
}

export default function CursorTracer() {
  const [trails, setTrails] = useState<Trail[]>([]);
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });
  const [eyePositions, setEyePositions] = useState<EyePositions>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastPosRef = useRef<MousePosition>({ x: 0, y: 0 });
  const shapeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const frameRef = useRef<number | null>(null); // ✅ used instead of let frameId

  // 🖱️ Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const dx = x - lastPosRef.current.x;
          const dy = y - lastPosRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 2) {
            const steps = Math.ceil(distance / 4);
            const newTrails: Trail[] = [];

            for (let i = 1; i <= steps; i++) {
              const t = i / steps;
              newTrails.push({
                id: Date.now() + Math.random() + i,
                x: lastPosRef.current.x + dx * t,
                y: lastPosRef.current.y + dy * t,
              });
            }

            setTrails((prev) => [...prev.slice(-25), ...newTrails]);
            lastPosRef.current = { x, y };
          }
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 🌀 Fade old trails
  useEffect(() => {
    const timer = setInterval(() => {
      setTrails((prev) => prev.slice(1));
    }, 35);
    return () => clearInterval(timer);
  }, []);

  // 👀 Track eye movement with requestAnimationFrame
  useLayoutEffect(() => {
    const updateEyes = () => {
      const newPositions: EyePositions = {};

      Object.keys(shapeRefs.current).forEach((id) => {
        const el = shapeRefs.current[id];
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = mousePos.x - centerX;
        const dy = mousePos.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxMove = 8;

        if (distance < 1) {
          newPositions[id] = { x: 0, y: 0 };
        } else {
          const moveX = (dx / distance) * Math.min(distance / 20, maxMove);
          const moveY = (dy / distance) * Math.min(distance / 20, maxMove);
          newPositions[id] = { x: moveX, y: moveY };
        }
      });

      setEyePositions(newPositions);
      frameRef.current = requestAnimationFrame(updateEyes);
    };

    frameRef.current = requestAnimationFrame(updateEyes);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [mousePos]);

  const shapes = [
    { id: "1", x: "25%", y: "35%", color: "bg-emerald-500", type: "blob" },
    { id: "2", x: "55%", y: "40%", color: "bg-sky-500", type: "square" },
    { id: "3", x: "40%", y: "65%", color: "bg-orange-500", type: "circle" },
  ];

  return (
    <div
      ref={containerRef}
      className="w-full bg-amber-50 flex items-center justify-center relative overflow-hidden min-h-screen cursor-none"
    >
      {/* 🧵 Cursor trail */}
      {trails.map((trail, i) => {
        const progress = (i + 1) / trails.length;
        const size = 6 + progress * 4;
        return (
          <div
            key={trail.id}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: trail.x,
              top: trail.y,
              width: `${size}px`,
              height: `${size}px`,
              transform: "translate(-50%, -50%)",
              opacity: progress * 0.15,
              background: "rgba(100, 100, 100, 0.3)",
              filter: "blur(0.5px)",
              transition: "all 0.12s ease-out",
            }}
          />
        );
      })}

      {/* 😃 Shapes with eyes */}
      {shapes.map((shape) => {
        const eye = eyePositions[shape.id] || { x: 0, y: 0 };
        return (
          <div
            key={shape.id}
            ref={(el) => {
              shapeRefs.current[shape.id] = el;
            }}
            className="absolute"
            style={{
              left: shape.x,
              top: shape.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className={`${shape.color} relative ${
                shape.type === "circle"
                  ? "rounded-full w-32 h-32"
                  : shape.type === "square"
                  ? "rounded-3xl w-40 h-40"
                  : "rounded-full w-48 h-40"
              }`}
              style={{
                clipPath:
                  shape.type === "blob"
                    ? "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)"
                    : undefined,
              }}
            >
              {/* 👀 Eyes */}
              <div className="absolute inset-0 flex items-center justify-center gap-4">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
                  >
                    <div
                      className="bg-black rounded-full w-5 h-5 transition-transform duration-150 ease-out"
                      style={{
                        transform: `translate(${eye.x}px, ${eye.y}px)`,
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* 🙂 Smile */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="w-16 h-8 border-b-4 border-black rounded-full" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
