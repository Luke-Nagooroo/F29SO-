import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { exportAPI } from "@/api";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

/**
 * Trigger a blob download in the browser.
 */
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Returns ISO date string for today minus `days` days (date-only, no time).
 */
function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

const FORMAT_OPTIONS = [
  {
    key: "pdf",
    label: "PDF Report",
    description: "Formatted report with summary tables",
    icon: FileText,
  },
  {
    key: "csv",
    label: "CSV Spreadsheet",
    description: "Raw data rows, importable to Excel / Sheets",
    icon: FileSpreadsheet,
  },
];

const RANGE_PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "Custom", days: null },
];

export default function ExportModal({ isOpen, onClose }) {
  const toast = useToast();
  const [format, setFormat] = useState("pdf");
  const [rangePreset, setRangePreset] = useState(30);
  const [startDate, setStartDate] = useState(daysAgo(30));
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  const isCustom = rangePreset === null;

  const handlePreset = (days) => {
    setRangePreset(days);
    if (days !== null) {
      setStartDate(daysAgo(days));
      setEndDate(new Date().toISOString().split("T")[0]);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = { startDate, endDate };
      const res =
        format === "pdf"
          ? await exportAPI.downloadPDF(params)
          : await exportAPI.downloadCSV(params);

      const filename =
        format === "pdf"
          ? `medxi-health-report-${startDate}-to-${endDate}.pdf`
          : `medxi-health-report-${startDate}-to-${endDate}.csv`;

      triggerDownload(res.data, filename);
      toast.success(`${format.toUpperCase()} downloaded successfully`);
      onClose();
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to generate export. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6 flex flex-col gap-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Download className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Export Health Data</h2>
                  <p className="text-xs text-muted-foreground">Download your health records</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Format selection */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Format</p>
              <div className="grid grid-cols-2 gap-2">
                {FORMAT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setFormat(opt.key)}
                      className={cn(
                        "flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left transition-all",
                        format === opt.key
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted/40",
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{opt.label}</span>
                      <span className="text-xs text-muted-foreground leading-tight">
                        {opt.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date range */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Date Range</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {RANGE_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handlePreset(p.days)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-medium border transition-all",
                      rangePreset === p.days
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {isCustom && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Start date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={endDate}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">End date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              )}

              {!isCustom && (
                <p className="text-xs text-muted-foreground">
                  {startDate} → {endDate}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={loading}
                className="px-4 py-2 text-sm rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {loading ? "Generating..." : `Export ${format.toUpperCase()}`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
