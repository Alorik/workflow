"use client"
import { ArrowRight } from "lucide-react";

export default function BeamButton() {
  return (
    <div className=" bg-transparent flex items-center  justify-center">
      <style>
        {`@keyframes beam-slide{
        0% {background-position: 200% center;}
        100% {background-postion: -200% center;}
      }`}
      </style>
      <button className="group relative px-8 py-2 rounded-full bg-slate-900 border border-slate-800 transition-all hover:scale-105 hover:border-slate-700 active:scale-95">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-400 via-white to-slate-400 bg-[length:200%_auto] animate-[beam-slide_2s_linear_infinite]">
            Analytics
          </span>
          <ArrowRight
            className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all"
            size={20}
          />
        </div>
      </button>
    </div>
  );
}