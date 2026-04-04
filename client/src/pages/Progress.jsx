import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Trophy } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { gamificationAPI } from "../api";
import WellnessScoreRing from "../components/gamification/WellnessScoreRing";
import LevelBadge from "../components/gamification/LevelBadge";
import StreakCounter from "../components/gamification/StreakCounter";
import DailyChallenges from "../components/gamification/DailyChallenges";
import WeeklyChallenges from "../components/gamification/WeeklyChallenges";
import AchievementGrid from "../components/gamification/AchievementGrid";
import Leaderboard from "../components/gamification/Leaderboard";
import DashboardDock from "../components/patient/DashboardDock";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackgroundPaths } from "@/components/ui/background-paths";

export default function Progress() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["gamification-stats"],
    queryFn: () => gamificationAPI.getStats().then((r) => r.data.data),
    staleTime: 10000,
    refetchInterval: 15000,
  });

  const handleSidebarNav = (tabId) => {
    navigate("/dashboard", { state: { tab: tabId } });
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <BackgroundPaths className="opacity-30 fixed inset-0 z-0 pointer-events-none" />
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-60 bg-[var(--bg-effect-1)]" />
        <div className="absolute bottom-1/3 right-1/4 w-[22rem] h-[22rem] rounded-full blur-3xl opacity-50 bg-[var(--bg-effect-2)]" />
        <div className="absolute top-2/3 left-1/2 w-[18rem] h-[18rem] rounded-full blur-3xl opacity-40 bg-[var(--bg-effect-3)]" />
      </div>
      <DashboardDock
        activeTab="progress"
        onTabChange={handleSidebarNav}
        role={user?.role || "patient"}
      />

      <div className="relative z-10 flex justify-center">
        <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 pb-28">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-primary" />
                  Progress
                </h1>
                <p className="text-muted-foreground mt-2">
                  Track your wellness journey and achievements
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top row: Wellness Score + Level + Streak */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6 flex flex-col items-center justify-center gap-3 h-full">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                      Wellness Score
                    </p>
                    <WellnessScoreRing score={stats?.wellnessScore || 0} />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex flex-col items-center justify-center gap-3 h-full">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                      Level &amp; XP
                    </p>
                    <LevelBadge
                      level={stats?.level || 1}
                      xpProgress={stats?.xpProgress || {}}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex flex-col items-center justify-center gap-3 h-full">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                      Activity Streak
                    </p>
                    <StreakCounter
                      currentStreak={stats?.currentStreak || 0}
                      longestStreak={stats?.longestStreak || 0}
                      frozen={stats?.streakFrozen || false}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Challenges row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DailyChallenges challenges={stats?.dailyChallenges || []} />
                <WeeklyChallenges challenges={stats?.weeklyChallenges || []} />
              </div>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <AchievementGrid achievements={stats?.achievements || []} />
                </CardContent>
              </Card>

              {/* Leaderboard */}
              <Card>
                <CardHeader>
                  <CardTitle>Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <Leaderboard />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
