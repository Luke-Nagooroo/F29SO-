import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pill, Plus, Check, X, Clock, AlertTriangle } from "lucide-react";
import { medicationAPI } from "../../api";
import { cn } from "@/lib/utils";
import AddMedicationModal from "./AddMedicationModal";
import MedicationList from "./MedicationList";
import MedicationAdherenceChart from "./MedicationAdherenceChart";

export default function MedicationDashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [tab, setTab] = useState("today");
  const queryClient = useQueryClient();

  const { data: todayMeds = [], isLoading } = useQuery({
    queryKey: ["medications-today"],
    queryFn: () => medicationAPI.getToday().then((r) => r.data.data),
  });

  const { data: stats } = useQuery({
    queryKey: ["medication-stats"],
    queryFn: () => medicationAPI.getStats().then((r) => r.data.data),
  });

  const logMutation = useMutation({
    mutationFn: ({ id, data }) => medicationAPI.logAdherence(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications-today"] });
      queryClient.invalidateQueries({ queryKey: ["medication-stats"] });
      queryClient.invalidateQueries({ queryKey: ["gamification-stats"] });
    },
  });

  const weekRate = stats?.adherenceRate ?? 0;

  const statusIcon = (status) => {
    if (status === "taken") return <Check className="w-4 h-4 text-green-500" />;
    if (status === "skipped") return <X className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const statusColor = (status) => {
    if (status === "taken") return "bg-green-500/10 border-green-500/30";
    if (status === "skipped") return "bg-red-500/10 border-red-500/30";
    return "bg-yellow-500/10 border-yellow-500/30";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Medications</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {weekRate}% adherence this month
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Medication
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-muted/40 rounded-xl w-fit">
        {["today", "all", "stats", "inactive"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "stats" ? "Adherence" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Today's Medications */}
      {tab === "today" && (
        <div className="space-y-3">
          {todayMeds.length === 0 ? (
            <div className="rounded-xl border border-border/50 bg-card/80 p-8 text-center">
              <Pill className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No medications scheduled today</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-sm text-primary hover:underline"
              >
                Add your first medication
              </button>
            </div>
          ) : (
            todayMeds.map((med) => (
              <div
                key={med._id}
                className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{med.name}</h3>
                    <p className="text-sm text-muted-foreground">{med.dosage} · {med.frequency.replace(/_/g, " ")}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {med.slots.map((slot, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border",
                        statusColor(slot.status),
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {statusIcon(slot.status)}
                        <span className="text-sm text-foreground">
                          {slot.time === "default" ? "Any time" : slot.time}
                        </span>
                      </div>
                      {slot.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => logMutation.mutate({ id: med._id, data: { taken: true, timeslot: slot.time } })}
                            disabled={logMutation.isPending}
                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors"
                          >
                            Take
                          </button>
                          <button
                            onClick={() => logMutation.mutate({ id: med._id, data: { taken: false, timeslot: slot.time } })}
                            disabled={logMutation.isPending}
                            className="px-3 py-1.5 bg-red-500/20 text-red-500 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors"
                          >
                            Skip
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* All Medications */}
      {tab === "all" && <MedicationList onAdd={() => setShowAddModal(true)} showInactiveOnly={false} />}

      {/* Adherence Chart */}
      {tab === "stats" && <MedicationAdherenceChart />}

      {/* Inactive Medications */}
      {tab === "inactive" && <MedicationList onAdd={() => setShowAddModal(true)} showInactiveOnly={true} />}

      {showAddModal && (
        <AddMedicationModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            queryClient.invalidateQueries({ queryKey: ["medications-today"] });
            queryClient.invalidateQueries({ queryKey: ["medications"] });
          }}
        />
      )}
    </div>
  );
}
