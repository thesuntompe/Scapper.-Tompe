import React from "react";
import { motion } from "motion/react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export default function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeMap = {
    sm: { box: "w-8 h-8", svg: 32, font: "text-base" },
    md: { box: "w-10 h-10", svg: 40, font: "text-lg" },
    lg: { box: "w-14 h-14", svg: 56, font: "text-2xl" },
    xl: { box: "w-20 h-20", svg: 80, font: "text-4xl" },
  };

  const current = sizeMap[size];

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Black Hole SVG Icon */}
      <div className={`relative ${current.box} flex items-center justify-center shrink-0`}>
        {/* Glowing cosmic background accent / accretion disk */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: 360,
          }}
          transition={{
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-600 to-indigo-700 opacity-60 blur-[3px]"
        />

        {/* Outer Circular Event Horizon boundary */}
        <svg
          width={current.svg}
          height={current.svg}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          {/* Gravitational lensing outer loop */}
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="url(#lensing-grad)"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="opacity-70"
          />

          {/* Accretion ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="32"
            stroke="url(#acretion-grad)"
            strokeWidth="5"
            animate={{
              strokeDashoffset: [0, 100],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
            strokeDasharray="20 10"
          />

          {/* The Singularity - Absolute Black center */}
          <circle cx="50" cy="50" r="18" fill="#111827" />
          <circle cx="50" cy="50" r="14" fill="#030712" />

          {/* Core quantum singularity point */}
          <motion.circle
            cx="50"
            cy="50"
            r="2"
            fill="#FFF"
            animate={{
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Definitions for gorgeous premium gradients */}
          <defs>
            <linearGradient id="lensing-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
            <linearGradient id="acretion-grad" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="1" />
              <stop offset="50%" stopColor="#4F46E5" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#312E81" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Subtle white highlight glow overlay */}
        <div className="absolute inset-2.5 rounded-full border border-white/10 pointer-events-none z-20" />
      </div>

      {/* Brand Text & Tagline */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className={`${current.font} font-extrabold tracking-tight text-slate-900 font-sans leading-none`}>
              Singularity
            </span>
            <span className={`${current.font} font-light text-indigo-600 font-sans leading-none`}>
              AI
            </span>
          </div>
          <span className="text-[10px] font-mono tracking-wider text-slate-400 font-bold uppercase mt-1 leading-none">
            Find. Build. Scale.
          </span>
        </div>
      )}
    </div>
  );
}
