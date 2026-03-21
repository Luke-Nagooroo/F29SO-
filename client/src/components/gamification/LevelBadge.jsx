import React from "react";
import { motion } from "framer-motion";

export default function LevelBadge({ level = 1, xpProgress = {} }) {
  const { current = 0, needed = 100, percentage = 0 } = xpProgress;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3"
    >
      {/* Badge */}
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-black shadow-lg shadow-primary/25 overflow-hidden relative">
          <span className="relative z-10">{level}</span>
          {/* Shine effect — clipped to badge bounds by overflow-hidden on parent */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
        </div>
      </div>

      {/* XP Progress */}
      <div className="w-full max-w-[160px] flex flex-col items-center gap-1">
        <span className="text-sm font-semibold text-foreground">Level {level}</span>
        <span className="text-xs text-muted-foreground">{current} / {needed} XP</span>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-1">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
