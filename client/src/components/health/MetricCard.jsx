import React from "react";
import { Card } from "@/components/ui/card";

const STATUS_STYLES = {
  normal: "border-emerald-500/40 bg-emerald-500/5",
  warning: "border-amber-500/40 bg-amber-500/5",
  critical: "border-rose-500/40 bg-rose-500/5",
};

export default function MetricCard({
  title,
  value,
  unit,
  status,
  icon,
  trend,
  onClick,
}) {
  const statusClass = STATUS_STYLES[status] || "border-border bg-card";

  return (
    <Card
      onClick={onClick}
      className={`p-5 transition-all ${statusClass} ${onClick ? "cursor-pointer hover:shadow-md" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">
              {value ?? "--"}
            </span>
            {unit ? (
              <span className="pb-1 text-sm text-muted-foreground">{unit}</span>
            ) : null}
          </div>
          {typeof trend === "number" ? (
            <p className="text-xs text-muted-foreground">
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% from previous reading
            </p>
          ) : null}
        </div>

        {icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-xl text-primary">
            {icon}
          </div>
        ) : null}
      </div>

      {status ? (
        <div className="mt-4 inline-flex rounded-full border border-border px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground">
          {status}
        </div>
      ) : null}
    </Card>
  );
}
