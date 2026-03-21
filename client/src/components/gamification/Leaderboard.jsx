import React from "react";
import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { gamificationAPI } from "../../api";

const RANK_STYLES = {
  1: "bg-yellow-500/10 border-yellow-500/30 text-yellow-600",
  2: "bg-gray-300/10 border-gray-400/30 text-gray-500",
  3: "bg-orange-600/10 border-orange-600/30 text-orange-600",
};

export default function Leaderboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["gamification-leaderboard"],
    queryFn: () => gamificationAPI.getLeaderboard().then((r) => r.data.data),
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Leaderboard</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Leaderboard</h3>
      </div>

      <div className="space-y-2">
        {(data || []).map((entry) => {
          const isMe = entry.userId === user?._id;
          const rankStyle = RANK_STYLES[entry.rank] || "";

          return (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                isMe
                  ? "border-primary/30 bg-primary/5"
                  : rankStyle
                    ? `${rankStyle} border`
                    : "border-border/20 bg-muted/10"
              }`}
            >
              {/* Rank */}
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  entry.rank <= 3
                    ? rankStyle
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {entry.rank}
              </span>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {entry.name} {isMe && "(You)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Level {entry.level} · {entry.streak}🔥
                </p>
              </div>

              {/* Wellness Score */}
              <span className="text-sm font-bold text-primary">
                {entry.wellnessScore}
              </span>
            </div>
          );
        })}

        {(!data || data.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No data yet
          </p>
        )}
      </div>
    </motion.div>
  );
}
