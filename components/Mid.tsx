"use client";
import React, { useRef } from "react";
import Image from "next/image";
import { useMotionTemplate, useScroll, useTransform } from "motion/react";
import { motion } from "motion/react";

export default function MidCard(){
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.1], [10, 0]);
  const translateY = useTransform(scrollYProgress, [0, 0.3], [-200, 150]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [0.8, 1.1]);

  const textScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.5]);
  const blur = useTransform(scrollYProgress, [0, 0.3], [0, 2]);

  const finalBlur = useMotionTemplate`blur(${blur}px)`;

  return (
    <div
      ref={containerRef}
      className="min-h-[200vh] w-full bg-transparent flex flex-col items-center pt-80 [perspective:800px] [transform-style:preserve-3d]"
    >
      <motion.h1
        style={{
          scale: textScale,
          opacity,
          filter: finalBlur,
          y: -90,
        }}
        className="text-8xl font-bold text-center"
      >
        Make Your Project Easy
      </motion.h1>
      <motion.div
        style={{
          rotateX: rotateX,
          translateZ: "60px",
          y: translateY,
          scale,
        }}
        className="w-[40%] rounded-3xl -mt-6 h-[700px] w-[900px] bg-transparent shadow-2xl p-2 border border-neutral-100"
      >
        <div className="bg-black h-full w-full rounded-[16px] ">
          <div className="bg-transparent h-full w-full rounded-[12px]">
            <Image
              className="h-full w-full"
              src="/mid.png"
              alt="mac"
              width={1024}
              height={700}
            ></Image>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

