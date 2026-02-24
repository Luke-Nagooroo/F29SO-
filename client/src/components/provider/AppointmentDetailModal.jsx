import React from "react";
import { CalendarDays, Clock3, NotebookPen, Stethoscope, UserRound, X } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

function AppointmentDetailModal({ appointment, isOpen, onClose, onCancel }) {
  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl rounded-[28px] shadow-xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardDescription>Appointment overview</CardDescription>
            <CardTitle className="mt-1 text-2xl">{appointment.title || appointment.patientName}</CardTitle>
          </div>
          <Button variant="ghost" onClick={onClose} className="h-10 w-10 rounded-full p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 rounded-[24px] bg-slate-50 p-5 md:grid-cols-2">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              <span>{appointment.dateLabel}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Clock3 className="h-4 w-4 text-slate-400" />
              <span>{appointment.timeLabel}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <UserRound className="h-4 w-4 text-slate-400" />
              <span>{appointment.patientName || appointment.providerName}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Stethoscope className="h-4 w-4 text-slate-400" />
              <span>{appointment.specialty || appointment.type}</span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div className="space-y-4">
              <div className="rounded-[24px] border border-slate-200 p-5">
                <div className="mb-2 flex items-center gap-2 text-slate-900">
                  <NotebookPen className="h-4 w-4" />
                  <p className="font-semibold">Visit reason</p>
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  {appointment.reason || "This early modal reserves a place for visit notes, symptoms, and provider instructions."}
                </p>
              </div>

              <div className="rounded-[24px] border border-slate-200 p-5">
                <p className="text-sm font-semibold text-slate-900">Provider note placeholder</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Later commits can add outcome notes, rescheduling, confirmation actions, and attachments here.
                </p>
              </div>
            </div>

            <div className="rounded-[24px] bg-slate-50 p-5 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Current status</p>
              <p className="mt-2 capitalize">{appointment.status}</p>
              <p className="mt-4 font-semibold text-slate-900">Visit type</p>
              <p className="mt-2">{appointment.type}</p>
              <p className="mt-4 font-semibold text-slate-900">Next refinement</p>
              <p className="mt-2">Add confirmations, API wiring, provider actions, and patient reminders.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onClose}>Close</Button>
            {appointment.status !== "cancelled" ? (
              <Button variant="ghost" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => onCancel?.(appointment)}>
                Cancel appointment
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AppointmentDetailModal;
