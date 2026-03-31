import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  format,
  subDays,
  startOfDay,
  isSameDay,
  startOfHour,
  getHours,
} from "date-fns";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Metrics that should be averaged per bucket (not summed)
const AVG_METRICS = new Set([
  "heartRate",
  "oxygenSaturation",
  "bloodPressure",
  "bloodGlucose",
  "weight",
]);

/**
 * Activity bar chart supporting day (hourly), week (daily), and month (daily) views.
 */
export default function WeeklyBarChart({
  data = [],
  metricType = "steps",
  goal,
  unit = "",
  color = "hsl(var(--primary))",
  timeframe = "week",
  serverDayTotal,
  className,
}) {
  const shouldAverage = AVG_METRICS.has(metricType);

  const extractValue = (m) => {
    const v =
      typeof m.value === "object"
        ? (m.value.value ?? m.value.systolic)
        : m.value;
    return Number(v) || 0;
  };

  /**
   * Aggregate readings for one day/bucket.
   * - Summable metrics (steps, calories, etc.): plain SUM — each reading is
   *   an incremental value, matching the server's dailyTotals aggregation.
   * - Averaged metrics (heartRate, SpO2, etc.): arithmetic mean.
   */
  const dailyTotal = (metrics) => {
    if (shouldAverage) {
      const sum = metrics.reduce((s, m) => s + extractValue(m), 0);
      return sum / metrics.length;
    }
    return metrics.reduce((s, m) => s + extractValue(m), 0);
  };

  // Build chart buckets based on timeframe
  const chartData = useMemo(() => {
    const today = new Date();

    if (timeframe === "day") {
      // Hourly buckets for today (6AM - 11PM)
      return Array.from({ length: 18 }).map((_, i) => {
        const hour = i + 6;
        const hourMetrics = data.filter((m) => {
          const d = new Date(m.timestamp);
          return isSameDay(d, today) && getHours(d) === hour;
        });

        let value = 0;
        if (hourMetrics.length > 0) {
          if (shouldAverage) {
            const sum = hourMetrics.reduce((s, m) => s + extractValue(m), 0);
            value = sum / hourMetrics.length;
          } else {
            value = hourMetrics.reduce((s, m) => s + extractValue(m), 0);
          }
        }

        return {
          label: hour === 0 ? "12 AM" : hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`,
          value: Math.round(value),
          date: today,
          isToday: true,
          isCurrent: getHours(today) === hour,
          metGoal: goal ? value >= goal : false,
        };
      });
    }

    if (timeframe === "month") {
      // Daily buckets for last 30 days
      return Array.from({ length: 30 }).map((_, i) => {
        const date = startOfDay(subDays(today, 29 - i));
        const dayMetrics = data.filter((m) =>
          isSameDay(new Date(m.timestamp), date),
        );

        let value = 0;
        if (dayMetrics.length > 0) {
          value = dailyTotal(dayMetrics);
        }

        return {
          label: format(date, "d"),
          value: Math.round(value),
          date,
          isToday: isSameDay(date, today),
          metGoal: goal ? value >= goal : false,
        };
      });
    }

    // Default: week (Mon-Sun)
    const dayOfWeek = today.getDay();
    const monday = startOfDay(
      subDays(today, dayOfWeek === 0 ? 6 : dayOfWeek - 1),
    );

    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);

      const dayMetrics = data.filter((m) =>
        isSameDay(new Date(m.timestamp), date),
      );

      let value = 0;
      if (dayMetrics.length > 0) {
        value = dailyTotal(dayMetrics);
      }

      return {
        label: DAY_LABELS[i],
        value: Math.round(value),
        date,
        isToday: isSameDay(date, today),
        metGoal: goal ? value >= goal : false,
      };
    });
  }, [data, goal, shouldAverage, timeframe]);

  // Header aggregate
  const daysWithData = chartData.filter((d) => d.value > 0);

  const aggregate = (() => {
    if (timeframe === "day") {
      // Use server-authoritative total if provided (matches metric tiles exactly)
      if (serverDayTotal !== undefined) return Math.round(serverDayTotal);
      // Fallback: average for avg-metrics, total (sum) for everything else
      if (shouldAverage) {
        return daysWithData.length > 0
          ? Math.round(daysWithData.reduce((s, d) => s + d.value, 0) / daysWithData.length)
          : 0;
      }
      return chartData.reduce((s, d) => s + d.value, 0);
    }
    // Week & Month: always show average per day
    if (daysWithData.length === 0) return 0;
    return Math.round(daysWithData.reduce((s, d) => s + d.value, 0) / daysWithData.length);
  })();

  const aggregateLabel = shouldAverage
    ? `avg ${unit} ${timeframe === "day" ? "today" : timeframe === "month" ? "this month" : "this week"}`
    : timeframe === "day"
      ? `${unit} today`
      : `avg ${unit}/day ${timeframe === "week" ? "this week" : "this month"}`;

  const maxValue = Math.max(...chartData.map((d) => d.value), goal || 0) * 1.15;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.[0]) {
      const d = payload[0].payload;
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg text-sm">
          <p className="font-medium text-foreground">
            {timeframe === "day" ? d.label : format(d.date, "EEEE, d MMM")}
          </p>
          <p className="text-primary font-bold text-lg">
            {d.value.toLocaleString()} {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  const chartHeight = timeframe === "month" ? 200 : 180;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("w-full", className)}
    >
      {/* Total / Average header */}
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-bold text-foreground">
          {aggregate.toLocaleString()}
        </span>
        <span className="text-sm text-muted-foreground">{aggregateLabel}</span>
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          barCategoryGap={timeframe === "month" ? "10%" : "20%"}
        >
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: timeframe === "month" ? 9 : 12,
              fill: "hsl(var(--muted-foreground))",
            }}
            interval={timeframe === "month" ? 4 : timeframe === "day" ? 2 : 0}
          />
          <YAxis hide domain={[0, maxValue || "auto"]} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "hsl(var(--muted))", radius: 6 }}
          />
          {goal && (
            <ReferenceLine
              y={goal}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="6 4"
              strokeWidth={1.5}
            />
          )}
          <Bar
            dataKey="value"
            radius={[6, 6, 0, 0]}
            maxBarSize={timeframe === "month" ? 14 : 36}
          >
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isToday || entry.isCurrent ? color : `${color}`}
                fillOpacity={entry.isToday || entry.isCurrent ? 1 : 0.65}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Goal checkmarks (week view only) */}
      {goal && timeframe === "week" && (
        <div className="flex justify-around mt-1 px-4">
          {chartData.map((d, i) => (
            <div key={i} className="flex flex-col items-center">
              {d.metGoal ? (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <svg
                    className="w-3.5 h-3.5 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              ) : (
                <div className="w-6 h-6" />
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
