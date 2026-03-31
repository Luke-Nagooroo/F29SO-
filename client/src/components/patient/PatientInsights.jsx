import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  AlertTriangle,
  Footprints,
  Moon,
  Flame,
  Droplets,
  Activity,
  Thermometer,
  Weight,
  Dumbbell,
  GlassWater,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { healthMetricsAPI } from "@/api";
import { cn } from "@/lib/utils";

// ── Icon mapping from AI response ─────────────────────────────────────
const ICON_MAP = {
  heart: Heart,
  steps: Footprints,
  sleep: Moon,
  calories: Flame,
  spo2: Droplets,
  bp: Activity,
  glucose: Droplets,
  weight: Weight,
  temp: Thermometer,
  water: GlassWater,
  exercise: Dumbbell,
  general: Lightbulb,
};

// ── Styles ─────────────────────────────────────────────────────────────
const severityStyles = {
  success:
    "border-emerald-200 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/50",
  warning:
    "border-amber-200 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/50",
  critical:
    "border-red-200 bg-red-50/80 dark:border-red-800 dark:bg-red-950/50",
};

const severityBadge = {
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  critical:
    "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

// ── Component ──────────────────────────────────────────────────────────
export default function PatientInsights({ className }) {
  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["aiHealthInsights"],
    queryFn: async () => {
      const res = await healthMetricsAPI.getAIInsights();
      return res.data;
    },
    staleTime: 10 * 60 * 1000, // cache for 10 min
    retry: 1,
  });

  const insights = response?.data || [];
  const isAI = response?.source === "ai";
  const isCached = response?.cached === true;
  const nextRefresh = response?.nextRefreshAt
    ? new Date(response.nextRefreshAt)
    : null;
  const canRefresh = !isCached || (nextRefresh && new Date() >= nextRefresh);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Health Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Health Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Start tracking health data to receive personalized insights.</p>
            <p className="text-sm mt-1">
              Connect Google Fit or add manual readings.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Health Insights
          <div className="ml-auto flex items-center gap-2">
            {isAI && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                AI-powered
              </span>
            )}
            <button
              onClick={() => refetch()}
              disabled={isFetching || !canRefresh}
              className="p-1 rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={canRefresh ? "Refresh insights" : "Available every 15 minutes"}
            >
              <RefreshCw
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground",
                  isFetching && "animate-spin",
                )}
              />
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 overflow-y-auto flex-1 min-h-0">
        {insights.map((insight, i) => {
          const Icon = ICON_MAP[insight.icon] || Lightbulb;
          const severity = insight.severity || "success";

          return (
            <motion.div
              key={insight.label + i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "rounded-xl border p-4",
                severityStyles[severity] || severityStyles.success,
              )}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-card p-2 shadow-sm shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">
                      {insight.label}
                    </span>
                    {severity === "critical" && (
                      <span
                        className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                          severityBadge.critical,
                        )}
                      >
                        <AlertTriangle className="h-3 w-3 inline mr-0.5 -mt-0.5" />
                        Abnormal
                      </span>
                    )}
                    {severity === "warning" && (
                      <span
                        className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                          severityBadge.warning,
                        )}
                      >
                        Needs attention
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-foreground/80 mt-1">
                    {insight.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 italic flex items-start gap-1">
                    <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" />
                    {insight.suggestion}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
