import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import AppointmentCard from "./AppointmentCard";
import BookAppointmentModal from "./BookAppointmentModal";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDateKey(date) {
  return date.toISOString().split("T")[0];
}

function buildMonthDays(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const end = new Date(last);
  end.setDate(last.getDate() + (6 - last.getDay()));

  const days = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function AppointmentsCalendar({ appointments = [], providers = [], onAppointmentsChange, showPatientActions = true, onSelectAppointment }) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()));
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const monthDays = useMemo(() => buildMonthDays(currentMonth), [currentMonth]);

  const appointmentsByDay = useMemo(() => {
    return appointments.reduce((accumulator, appointment) => {
      const key = appointment.date;
      if (!accumulator[key]) accumulator[key] = [];
      accumulator[key].push(appointment);
      return accumulator;
    }, {});
  }, [appointments]);

  const selectedDayAppointments = appointmentsByDay[selectedDate] || [];
  const monthLabel = currentMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const handleSaveAppointment = (appointment) => {
    onAppointmentsChange?.([...appointments, appointment]);
    setSelectedDate(appointment.date);
  };

  const handleCancelAppointment = (target) => {
    onAppointmentsChange?.(
      appointments.map((appointment) =>
        appointment.id === target.id ? { ...appointment, status: "cancelled" } : appointment,
      ),
    );
    setSelectedAppointment((current) => (current?.id === target.id ? { ...current, status: "cancelled" } : current));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="rounded-[28px]">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardDescription>Calendar view</CardDescription>
            <CardTitle className="mt-1 text-2xl">{monthLabel}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
            {dayNames.map((day) => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {monthDays.map((date) => {
              const key = formatDateKey(date);
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isSelected = selectedDate === key;
              const dayAppointments = appointmentsByDay[key] || [];

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(key)}
                  className={`min-h-[92px] rounded-2xl border p-3 text-left transition ${isSelected ? "border-sky-400 bg-sky-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"} ${isCurrentMonth ? "opacity-100" : "opacity-50"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">{date.getDate()}</span>
                    {dayAppointments.length ? (
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-900 px-2 text-[11px] font-semibold text-white">
                        {dayAppointments.length}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 space-y-2">
                    {dayAppointments.slice(0, 2).map((appointment) => (
                      <div key={appointment.id} className="rounded-xl bg-slate-100 px-2 py-1.5 text-[11px] text-slate-600">
                        <p className="font-medium text-slate-800">{appointment.timeLabel}</p>
                        <p className="truncate">{appointment.patientName || appointment.providerName}</p>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[28px]">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardDescription>Selected day</CardDescription>
            <CardTitle className="mt-1 text-2xl">{new Date(selectedDate).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</CardTitle>
          </div>
          {showPatientActions ? (
            <Button onClick={() => setIsBookingOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Book appointment
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedDayAppointments.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
              No appointments are scheduled for this day yet. This is a good place for later availability checks, reminders, and API-backed updates.
            </div>
          ) : (
            selectedDayAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                compact={!showPatientActions}
                onView={(appointment) => {
                  setSelectedAppointment(appointment);
                  onSelectAppointment?.(appointment);
                }}
                onCancel={handleCancelAppointment}
              />
            ))
          )}
        </CardContent>
      </Card>

      <BookAppointmentModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        providers={providers}
        initialDate={selectedDate}
        onSave={handleSaveAppointment}
      />

    </div>
  );
}

export default AppointmentsCalendar;
