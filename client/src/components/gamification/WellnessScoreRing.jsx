import React from "react";
import { motion } from "framer-motion";

const getScoreColor = (score) => {
  if (score <= 30) return { ring: "#ef4444", glow: "rgba(239,68,68,0.3)" };
  if (score <= 60) return { ring: "#eab308", glow: "rgba(234,179,8,0.3)" };
  if (score <= 80) return { ring: "#22c55e", glow: "rgba(34,197,94,0.3)" };
  return { ring: "#10b981", glow: "rgba(16,185,129,0.4)" };
};

export default function WellnessScoreRing({ score = 0, size = "lg" }) {
  const dimensions = size === "sm" ? 120 : size === "md" ? 160 : 200;
  const strokeWidth = size === "sm" ? 8 : 10;
  const radius = (dimensions - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const { ring, glow } = getScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dimensions, height: dimensions }}>
        <svg width={dimensions} height={dimensions} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <motion.circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            fill="none"
            stroke={ring}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              filter: score > 80 ? `drop-shadow(0 0 8px ${glow})` : "none",
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-bold text-foreground"
            style={{ fontSize: size === "sm" ? "1.5rem" : "2.25rem" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground font-medium">
            points
          </span>
        </div>
      </div>
    </div>
  );
}
