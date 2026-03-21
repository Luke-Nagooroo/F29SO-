import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

export default function WeeklyChallenges({ challenges = [] }) {
  const daysLeft = () => {
    if (!challenges.length || !challenges[0].expiresAt) return 0;
    const diff = new Date(challenges[0].expiresAt) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">This Week</h3>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {daysLeft()} days left
        </span>
      </div>

      <div className="space-y-4">
        {challenges.map((challenge) => {
          const pct = challenge.progress
            ? Math.round(
                (challenge.progress.current / challenge.progress.target) * 100,
              )
            : 0;

          return (
            <div key={challenge.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {challenge.title}
                </p>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                  +{challenge.xpReward} XP
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(pct, 100)}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                {challenge.progress?.current || 0} / {challenge.progress?.target || 0}
              </p>
            </div>
          );
        })}

        {challenges.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No weekly challenges yet
          </p>
        )}
      </div>
    </motion.div>
  );
}
