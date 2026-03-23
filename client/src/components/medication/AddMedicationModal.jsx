import React, { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import { medicationAPI } from "../../api";

const FREQUENCY_OPTIONS = [
  { value: "once_daily", label: "Once daily", times: 1 },
  { value: "twice_daily", label: "Twice daily", times: 2 },
  { value: "three_times_daily", label: "Three times daily", times: 3 },
  { value: "as_needed", label: "As needed", times: 0 },
  { value: "weekly", label: "Weekly", times: 1 },
];

export default function AddMedicationModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    frequency: "once_daily",
    times: ["08:00"],
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFrequencyChange = (freq) => {
    const opt = FREQUENCY_OPTIONS.find((f) => f.value === freq);
    const count = opt?.times || 0;
    const defaults = ["08:00", "14:00", "20:00"];
    setForm({
      ...form,
      frequency: freq,
      times: count > 0 ? defaults.slice(0, count) : [],
    });
  };

  const updateTime = (index, value) => {
    const updated = [...form.times];
    updated[index] = value;
    setForm({ ...form, times: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.dosage) {
      setError("Name and dosage are required");
      return;
    }
    setLoading(true);
    try {
      await medicationAPI.create(form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add medication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Add Medication</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted/60 text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Medication Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Metformin"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Dosage</label>
            <input
              type="text"
              value={form.dosage}
              onChange={(e) => setForm({ ...form, dosage: e.target.value })}
              placeholder="e.g. 500mg"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Frequency</label>
            <select
              value={form.frequency}
              onChange={(e) => handleFrequencyChange(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {form.times.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Scheduled Times</label>
              <div className="space-y-2">
                {form.times.map((time, i) => (
                  <input
                    key={i}
                    type="time"
                    value={time}
                    onChange={(e) => updateTime(i, e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Take with food..."
              rows={2}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border rounded-xl text-foreground text-sm font-medium hover:bg-muted/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Medication"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
