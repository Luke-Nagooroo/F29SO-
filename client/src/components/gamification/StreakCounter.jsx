import React from "react";
import { motion } from "framer-motion";
import { Flame, Snowflake } from "lucide-react";

export default function StreakCounter({
  currentStreak = 0,
  longestStreak = 0,
  frozen = false,
}) {
  const isActive = currentStreak > 0 && !frozen;
  const isDead = currentStreak === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-1"
    >
      <div className="relative">
        {frozen ? (
          <div className="relative">
            <Flame className="w-10 h-10 text-muted-foreground/40" />
            <Snowflake className="w-5 h-5 text-blue-400 absolute -top-1 -right-1" />
          </div>
        ) : (
          <Flame
            className={`w-10 h-10 ${
              isDead
                ? "text-muted-foreground/30"
                : "text-orange-500"
            }`}
            style={
              isActive
                ? {
                    filter: "drop-shadow(0 0 6px rgba(249,115,22,0.5))",
                  }
                : undefined
            }
          />
        )}
      </div>

      <span className="text-2xl font-bold text-foreground">{currentStreak}</span>
      <span className="text-xs text-muted-foreground">
        {frozen ? "Frozen — log something today!" : "day streak"}
      </span>
      <span className="text-xs text-muted-foreground/60">
        best: {longestStreak}
      </span>
    </motion.div>
  );
}
