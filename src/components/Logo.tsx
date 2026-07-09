import React from "react";
import { motion } from "motion/react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export default function Logo({ size = "md", showText = true }: LogoProps) {
  // Size map scaled down by 15% further for premium density
  const sizeMap = {
    sm: { box: "w-5 h-5", svg: 20, font: "text-xs" },
    md: { box: "w-7 h-7", svg: 28, font: "text-sm" },
    lg: { box: "w-9 h-9", svg: 36, font: "text-lg" },
    xl: { box: "w-13 h-13", svg: 52, font: "text-2xl" },
  };

  const current = sizeMap[size];

  return (
    <div className="flex items-center gap-2 select-none">
      {/* Premium Minimal Vector Logo */}
      <div className={`relative ${current.box} flex items-center justify-center shrink-0`}>
        <svg
          width={current.svg}
          height={current.svg}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Thin Purple Orbit Ring */}
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="#A855F7"
            strokeWidth="1.5"
            className="opacity-90"
          />

          {/* Sharp Black Singularity Core */}
          <circle cx="50" cy="50" r="15" fill="#000000" stroke="#374151" strokeWidth="1.5" />

          {/* Tiny Stars */}
          <circle cx="25" cy="30" r="1.5" fill="#FFFFFF" className="opacity-70" />
          <circle cx="75" cy="35" r="1.2" fill="#FFFFFF" className="opacity-80" />
          <circle cx="35" cy="72" r="1" fill="#FFFFFF" className="opacity-60" />
          <circle cx="70" cy="70" r="1.5" fill="#A855F7" className="opacity-90" />

          {/* Orbit Star/Dot */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "50px 50px" }}
          >
            <circle cx="50" cy="12" r="2.5" fill="#FFFFFF" />
          </motion.g>
        </svg>
      </div>

      {/* Brand Text & Tagline */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-0.5">
            <span className={`${current.font} font-extrabold tracking-tight text-white font-sans leading-none`}>
              Singularity
            </span>
            <span className={`${current.font} font-semibold text-[#A855F7] font-sans leading-none`}>
              AI
            </span>
          </div>
          <span className="text-[8px] font-mono tracking-widest text-slate-500 font-bold uppercase mt-0.5 leading-none">
            FIND. BUILD. SCALE.
          </span>
        </div>
      )}
    </div>
  );
}
