import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { medicationAPI } from "../../api";
import { cn } from "@/lib/utils";

export default function MedicationAdherenceChart() {
  const [days, setDays] = useState(30);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["medication-stats", days],
    queryFn: () => medicationAPI.getStats({ days }).then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/80 p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const breakdown = stats?.dailyBreakdown || {};
  const chartData = Object.entries(breakdown)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      adherence: d.total > 0 ? Math.round((d.taken / d.total) * 100) : 0,
      taken: d.taken,
      missed: d.missed,
    }));

  return (
    <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Adherence Rate</h3>
          <p className="text-sm text-muted-foreground">
            {stats?.adherenceRate ?? 0}% overall · {stats?.totalTaken ?? 0}/{stats?.totalExpected ?? 0} doses taken
          </p>
        </div>
        <div className="flex gap-1 p-1 bg-muted/40 rounded-lg">
          {[7, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                days === d
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          No adherence data yet. Start logging your medications!
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value, name) => [`${value}%`, "Adherence"]}
            />
            <Bar dataKey="adherence" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    entry.adherence >= 80
                      ? "hsl(142, 71%, 45%)"
                      : entry.adherence >= 50
                        ? "hsl(48, 96%, 53%)"
                        : "hsl(0, 84%, 60%)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
