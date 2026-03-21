import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";

const TIER_COLORS = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
};

export default function AchievementToast({ achievement, onDismiss }) {
  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(onDismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onDismiss]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, x: 100, y: -20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed top-4 right-4 z-[100] bg-card border border-border rounded-xl shadow-2xl p-4 flex items-center gap-3 max-w-sm"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{
              backgroundColor: `${TIER_COLORS[achievement.tier] || "#8b5cf6"}20`,
            }}
          >
            {achievement.icon || <Trophy className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-wide">
              Achievement Unlocked!
            </p>
            <p className="text-sm font-semibold text-foreground">
              {achievement.title}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {achievement.tier}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
