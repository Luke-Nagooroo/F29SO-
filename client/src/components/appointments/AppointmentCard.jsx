import React from "react";
import { CalendarDays, Clock3, FileText, Stethoscope, UserRound } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

const statusStyles = {
  scheduled: "bg-sky-50 text-sky-700 border-sky-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-slate-100 text-slate-600 border-slate-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

function AppointmentCard({ appointment, compact = false, onView, onCancel }) {
  return (
    <Card className="rounded-[24px] transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[appointment.status] || statusStyles.scheduled}`}>
                {appointment.status}
              </span>
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {appointment.type}
              </span>
            </div>

            <div>
              <p className="text-lg font-semibold text-slate-900">{appointment.title || appointment.patientName || appointment.providerName}</p>
              <p className="mt-1 text-sm text-slate-500">{appointment.subtitle || "A simple early appointment card with room for live data later."}</p>
            </div>

            <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                <span>{appointment.dateLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-slate-400" />
                <span>{appointment.timeLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-slate-400" />
                <span>{appointment.patientName || appointment.providerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-slate-400" />
                <span>{appointment.specialty || "General review"}</span>
              </div>
            </div>

            {appointment.reason ? (
              <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                <div className="mb-1 flex items-center gap-2 text-slate-900">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Visit reason</span>
                </div>
                <p>{appointment.reason}</p>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-row gap-2 lg:flex-col">
            <Button variant="outline" onClick={() => onView?.(appointment)}>
              View details
            </Button>
            {!compact && appointment.status !== "cancelled" ? (
              <Button variant="ghost" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => onCancel?.(appointment)}>
                Cancel
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AppointmentCard;
