import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pill, Trash2, RotateCcw, XCircle } from "lucide-react";
import { medicationAPI } from "../../api";
import { useToast } from "../../context/ToastContext";
import { cn } from "@/lib/utils";

function ConfirmModal({ action, onConfirm, onCancel }) {
  if (!action) return null;
  const isDelete = action === "hardDelete";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
              isDelete ? "bg-red-500/15" : "bg-orange-500/15",
            )}
          >
            {isDelete ? (
              <Trash2 className={cn("w-5 h-5", "text-red-500")} />
            ) : (
              <XCircle className="w-5 h-5 text-orange-500" />
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {isDelete ? "Permanently delete?" : "Deactivate medication?"}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isDelete
                ? "This cannot be undone. The medication and all its history will be removed."
                : "It will be moved to the Inactive tab. You can reactivate it later."}
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "px-4 py-2 text-sm rounded-xl font-medium text-white transition-colors",
              isDelete ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600",
            )}
          >
            {isDelete ? "Delete" : "Deactivate"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MedicationList({ onAdd, showInactiveOnly = false }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  // { id, action: "deactivate" | "hardDelete" }
  const [pendingConfirm, setPendingConfirm] = useState(null);

  const { data: medications = [], isLoading } = useQuery({
    queryKey: ["medications", showInactiveOnly],
    queryFn: () =>
      medicationAPI
        .getAll({ active: showInactiveOnly ? "false" : "true" })
        .then((r) => r.data.data),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => medicationAPI.delete(id),
    onSuccess: () => {
      toast.success("Medication deactivated");
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      queryClient.invalidateQueries({ queryKey: ["medications-today"] });
    },
    onError: () => toast.error("Failed to deactivate medication"),
  });

  const reactivateMutation = useMutation({
    mutationFn: (id) => medicationAPI.update(id, { isActive: true }),
    onSuccess: () => {
      toast.success("Medication reactivated");
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      queryClient.invalidateQueries({ queryKey: ["medications-today"] });
    },
    onError: () => toast.error("Failed to reactivate medication"),
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id) => medicationAPI.hardDelete(id),
    onSuccess: () => {
      toast.success("Medication permanently deleted");
      queryClient.invalidateQueries({ queryKey: ["medications"] });
    },
    onError: () => toast.error("Failed to delete medication"),
  });

  const confirmAction = (id, action) => setPendingConfirm({ id, action });

  const executeConfirm = () => {
    if (!pendingConfirm) return;
    const { id, action } = pendingConfirm;
    setPendingConfirm(null);
    if (action === "deactivate") deactivateMutation.mutate(id);
    else if (action === "hardDelete") hardDeleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        action={pendingConfirm?.action}
        onConfirm={executeConfirm}
        onCancel={() => setPendingConfirm(null)}
      />

      <div className="space-y-3">
        {medications.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card/80 p-8 text-center">
            <Pill className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {showInactiveOnly ? "No inactive medications" : "No medications found"}
            </p>
            {!showInactiveOnly && (
              <button onClick={onAdd} className="mt-3 text-sm text-primary hover:underline">
                Add your first medication
              </button>
            )}
          </div>
        ) : (
          medications.map((med) => (
            <div
              key={med._id}
              className={cn(
                "rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 flex items-center justify-between",
                showInactiveOnly && "opacity-60",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Pill className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{med.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {med.dosage} · {med.frequency.replace(/_/g, " ")}
                    {med.times?.length > 0 && ` · ${med.times.join(", ")}`}
                  </p>
                  {med.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">{med.notes}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {showInactiveOnly ? (
                  <>
                    <button
                      onClick={() => reactivateMutation.mutate(med._id)}
                      disabled={reactivateMutation.isPending}
                      title="Reactivate medication"
                      className="p-2 rounded-lg hover:bg-green-500/10 text-muted-foreground hover:text-green-500 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmAction(med._id, "hardDelete")}
                      disabled={hardDeleteMutation.isPending}
                      title="Permanently delete"
                      className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => confirmAction(med._id, "deactivate")}
                      disabled={deactivateMutation.isPending}
                      title="Deactivate medication"
                      className="p-2 rounded-lg hover:bg-orange-500/10 text-muted-foreground hover:text-orange-500 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmAction(med._id, "hardDelete")}
                      disabled={hardDeleteMutation.isPending}
                      title="Permanently delete"
                      className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
