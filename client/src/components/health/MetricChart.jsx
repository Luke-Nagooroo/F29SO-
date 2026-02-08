import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatPoint(point) {
  const label = point?.label || point?.date || "Reading";
  const value = point?.value;
  return { label, value };
}

export default function MetricChart({ data = [], unit = "", height = 260 }) {
  if (!data.length) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-border bg-card text-sm text-muted-foreground">
        No metric data yet.
      </div>
    );
  }

  const chartData = data.map(formatPoint);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">Metric Trend</h3>
        <p className="text-sm text-muted-foreground">
          Recent readings visualized over time.
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-xl border border-border bg-background px-3 py-2 shadow-lg">
                  <p className="text-xs text-muted-foreground">
                    {payload[0].payload.label}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {payload[0].value} {unit}
                  </p>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
