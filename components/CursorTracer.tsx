"use client";

import { useState, useEffect, useRef } from "react";

export default function CursorCard() {
  const [trails, setTrails] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [eyePositions, setEyePositions] = useState({});
  const containerRef = useRef(null);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const shapeRefs = useRef({});

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Always update global mouse position for eye tracking
      setMousePos({ x: e.clientX, y: e.clientY });

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();

        // Only create trails when cursor is inside the container
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
            const newTrails = [];

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

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTrails((prev) => prev.slice(1));
    }, 35);

    return () => clearInterval(timer);
  }, []);

  // Calculate eye positions whenever mouse moves
  useEffect(() => {
    const newEyePositions = {};

    Object.keys(shapeRefs.current).forEach((shapeId) => {
      const shapeElement = shapeRefs.current[shapeId];
      if (shapeElement) {
        const rect = shapeElement.getBoundingClientRect();
        const shapeCenterX = rect.left + rect.width / 2;
        const shapeCenterY = rect.top + rect.height / 2;

        const dx = mousePos.x - shapeCenterX;
        const dy = mousePos.y - shapeCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxMove = 8;

        if (distance < 1) {
          newEyePositions[shapeId] = { x: 0, y: 0 };
        } else {
          const moveX = (dx / distance) * Math.min(distance / 20, maxMove);
          const moveY = (dy / distance) * Math.min(distance / 20, maxMove);
          newEyePositions[shapeId] = { x: moveX, y: moveY };
        }
      }
    });

    setEyePositions(newEyePositions);
  }, [mousePos]);

  const shapes = [
    { id: 1, x: "25%", y: "35%", color: "bg-emerald-500", type: "blob" },
    { id: 2, x: "55%", y: "40%", color: "bg-sky-500", type: "square" },
    { id: 3, x: "40%", y: "65%", color: "bg-orange-500", type: "circle" },
  ];

  return (
    <div
      ref={containerRef}
      className="w-full bg-amber-50 flex items-center justify-center relative overflow-hidden min-h-screen cursor-none"
    >
      {/* Subtle trail */}
      {trails.map((trail, index) => {
        const progress = (index + 1) / trails.length;
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

      {/* Shapes with eyes */}
      {shapes.map((shape) => {
        const eyePos = eyePositions[shape.id] || { x: 0, y: 0 };

        return (
          <div
            key={shape.id}
            ref={(el) => (shapeRefs.current[shape.id] = el)}
            className="absolute"
            style={{
              left: shape.x,
              top: shape.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Shape background */}
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
              {/* Eyes container */}
              <div className="absolute inset-0 flex items-center justify-center gap-4">
                {/* Left eye */}
                <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                  <div
                    className="bg-black rounded-full w-5 h-5 transition-transform duration-150 ease-out"
                    style={{
                      transform: `translate(${eyePos.x}px, ${eyePos.y}px)`,
                    }}
                  />
                </div>

                {/* Right eye */}
                <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                  <div
                    className="bg-black rounded-full w-5 h-5 transition-transform duration-150 ease-out"
                    style={{
                      transform: `translate(${eyePos.x}px, ${eyePos.y}px)`,
                    }}
                  />
                </div>
              </div>

              {/* Smile */}
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
