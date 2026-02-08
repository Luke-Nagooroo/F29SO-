import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const metricOptions = {
  heartRate: { label: "Heart Rate", unit: "bpm", placeholder: "72" },
  bloodPressure: {
    label: "Blood Pressure",
    unit: "mmHg",
    placeholder: "120/80",
  },
  bloodGlucose: { label: "Blood Glucose", unit: "mg/dL", placeholder: "100" },
  weight: { label: "Weight", unit: "kg", placeholder: "70" },
  temperature: { label: "Temperature", unit: "°C", placeholder: "36.8" },
};

export default function AddMetricModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    metricType: "heartRate",
    value: "",
    notes: "",
  });

  const selectedMetric = useMemo(
    () => metricOptions[form.metricType],
    [form.metricType],
  );

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.value.trim()) return;

    const payload = {
      metricType: form.metricType,
      value: form.value,
      unit: selectedMetric.unit,
      notes: form.notes.trim(),
      source: "manual",
    };

    onSave?.(payload);
    setForm({ metricType: "heartRate", value: "", notes: "" });
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Add Metric</h2>
            <p className="text-sm text-muted-foreground">
              Log a new health reading manually.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metricType">Metric Type</Label>
            <select
              id="metricType"
              value={form.metricType}
              onChange={(event) => handleChange("metricType", event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none"
            >
              {Object.entries(metricOptions).map(([key, option]) => (
                <option key={key} value={key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metricValue">Value ({selectedMetric.unit})</Label>
            <Input
              id="metricValue"
              value={form.value}
              onChange={(event) => handleChange("value", event.target.value)}
              placeholder={selectedMetric.placeholder}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metricNotes">Notes</Label>
            <textarea
              id="metricNotes"
              rows="3"
              value={form.notes}
              onChange={(event) => handleChange("notes", event.target.value)}
              placeholder="Optional context about this reading"
              className="flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Metric</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
