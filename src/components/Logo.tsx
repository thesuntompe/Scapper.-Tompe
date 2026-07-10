import React from "react";
import { motion } from "motion/react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export default function Logo({ size = "md", showText = true }: LogoProps) {
  // Size map scaled down for ultra-precise UI density
  const sizeMap = {
    sm: { box: "w-5 h-5", svg: 20, font: "text-xs" },
    md: { box: "w-7 h-7", svg: 28, font: "text-sm" },
    lg: { box: "w-9 h-9", svg: 36, font: "text-lg" },
    xl: { box: "w-13 h-13", svg: 52, font: "text-2xl" },
  };

  const current = sizeMap[size];

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* High-End Rings & Orbit Core Vector Logo */}
      <div className={`relative ${current.box} flex items-center justify-center shrink-0`}>
        <svg
          width={current.svg}
          height={current.svg}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Outer Shimmer Halo */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="url(#purpleHalo)"
            strokeWidth="0.75"
            strokeDasharray="4 4"
            className="opacity-50 animate-[spin_40s_linear_infinite]"
          />

          {/* Primary Gravitational Orbit Ring (Perfect Circle) */}
          <circle
            cx="50"
            cy="50"
            r="36"
            stroke="url(#ringGradient1)"
            strokeWidth="1.5"
            className="opacity-80"
          />

          {/* Secondary Intersecting Slanted Orbit Ring (Ellipse) */}
          <ellipse
            cx="50"
            cy="50"
            rx="36"
            ry="14"
            stroke="url(#ringGradient2)"
            strokeWidth="1"
            transform="rotate(-30 50 50)"
            className="opacity-65"
          />

          {/* Tertiary Intersecting Slanted Orbit Ring (Opposite Ellipse) */}
          <ellipse
            cx="50"
            cy="50"
            rx="36"
            ry="14"
            stroke="url(#ringGradient2)"
            strokeWidth="1"
            transform="rotate(30 50 50)"
            className="opacity-65 animate-pulse"
          />

          {/* High-Contrast Luminous Central Singularity Core */}
          <circle
            cx="50"
            cy="50"
            r="12"
            fill="#090d16"
            stroke="#a855f7"
            strokeWidth="2"
          />
          <circle
            cx="50"
            cy="50"
            r="5"
            fill="url(#coreGlow)"
            className="animate-pulse"
          />

          {/* Orbiting Quantum Particles (Smoothly Rotated via CSS) */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "50px 50px" }}
          >
            <circle cx="50" cy="14" r="3" fill="#ffffff" className="shadow-lg" />
            <circle cx="50" cy="14" r="1.5" fill="#a855f7" />
          </motion.g>

          <motion.g
            animate={{ rotate: -360 }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "50px 50px" }}
          >
            <circle cx="14" cy="50" r="2" fill="#d8b4fe" />
          </motion.g>

          {/* Gradients Definitions */}
          <defs>
            <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d8b4fe" />
              <stop offset="100%" stopColor="#a855f7" />
            </radialGradient>
            <linearGradient id="ringGradient1" x1="0" y1="50" x2="100" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#d8b4fe" />
            </linearGradient>
            <linearGradient id="ringGradient2" x1="0" y1="50" x2="100" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="purpleHalo" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
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
          <span className="text-[8px] font-mono tracking-widest text-slate-500 font-bold uppercase mt-1 leading-none">
            FIND. BUILD. SCALE.
          </span>
        </div>
      )}
    </div>
  );
}
