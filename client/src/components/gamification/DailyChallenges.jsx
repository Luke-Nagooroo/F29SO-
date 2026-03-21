import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Gift } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gamificationAPI } from "../../api";

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-xs text-muted-foreground flex items-center gap-1">
      <Clock className="w-3 h-3" /> {timeLeft}
    </span>
  );
}

export default function DailyChallenges({ challenges = [], compact = false }) {
  const queryClient = useQueryClient();

  const claimMutation = useMutation({
    mutationFn: (id) => gamificationAPI.claimChallenge(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gamification-stats"] }),
  });

  const allDone = challenges.every((c) => c.completed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Today's Challenges
        </h3>
        <CountdownTimer />
      </div>

      {allDone ? (
        <div className="text-center py-4 text-muted-foreground">
          <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <p className="text-sm">All done! Come back tomorrow</p>
        </div>
      ) : (
        <div className="space-y-3">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                challenge.completed
                  ? "border-green-500/20 bg-green-500/5"
                  : "border-border/30 bg-muted/20"
              }`}
            >
              {/* Status icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  challenge.completed
                    ? "bg-green-500/20 text-green-500"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {challenge.completed ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    challenge.completed
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {challenge.title}
                </p>
              </div>

              {/* XP badge / Claim button */}
              {challenge.completed && !challenge.claimed ? (
                <button
                  onClick={() => claimMutation.mutate(challenge.id)}
                  disabled={claimMutation.isPending}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1"
                >
                  <Gift className="w-3 h-3" />
                  Claim
                </button>
              ) : (
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-md ${
                    challenge.claimed
                      ? "bg-green-500/10 text-green-500"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {challenge.claimed ? "Claimed" : `+${challenge.xpReward} XP`}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
