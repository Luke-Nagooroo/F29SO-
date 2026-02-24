import React, { useMemo, useState } from "react";
import { CalendarDays, Clock3, Stethoscope } from "lucide-react";
import AppointmentsCalendar from "../components/appointments/AppointmentsCalendar";
import AppointmentCard from "../components/appointments/AppointmentCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

const providers = [
  { id: "prov-1", name: "Dr. Sana Ahmed", specialty: "Cardiology", slots: ["09:00", "10:30", "01:00", "03:30"] },
  { id: "prov-2", name: "Dr. Hamza Rauf", specialty: "General Medicine", slots: ["08:30", "11:00", "02:00", "04:00"] },
  { id: "prov-3", name: "Dr. Noor Fatima", specialty: "Endocrinology", slots: ["09:30", "12:00", "02:30", "04:30"] },
];

const starterAppointments = [
  {
    id: "apt-1",
    title: "Follow-up with Dr. Sana Ahmed",
    providerName: "Dr. Sana Ahmed",
    specialty: "Cardiology",
    patientName: "Current patient",
    type: "Follow-up",
    status: "confirmed",
    date: new Date().toISOString().split("T")[0],
    dateLabel: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    time: "09:30",
    timeLabel: "09:30",
    reason: "Review blood pressure trend and hydration reminders.",
    subtitle: "Your next scheduled check-in",
  },
  {
    id: "apt-2",
    title: "Consultation with Dr. Hamza Rauf",
    providerName: "Dr. Hamza Rauf",
    specialty: "General Medicine",
    patientName: "Current patient",
    type: "Consultation",
    status: "scheduled",
    date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
    dateLabel: new Date(Date.now() + 172800000).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    time: "11:00",
    timeLabel: "11:00",
    reason: "Discuss fatigue, sleep quality, and current activity targets.",
    subtitle: "Upcoming review",
  },
];

function Appointments() {
  const [appointments, setAppointments] = useState(starterAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const summary = useMemo(() => ({
    upcoming: appointments.filter((item) => item.status !== "cancelled").length,
    confirmed: appointments.filter((item) => item.status === "confirmed").length,
    specialists: new Set(appointments.map((item) => item.specialty)).size,
  }), [appointments]);

  const handleCancel = (target) => {
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === target.id ? { ...appointment, status: "cancelled" } : appointment,
      ),
    );
    setSelectedAppointment((current) => (current?.id === target.id ? { ...current, status: "cancelled" } : current));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Appointments</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Schedule and review visits in one place</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                This first pass brings appointment booking, a calendar view, and an upcoming visit list into a dedicated patient page. Live availability, notifications, and provider confirmations can be expanded later.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { icon: CalendarDays, label: "Upcoming visits", value: summary.upcoming },
                { icon: Clock3, label: "Confirmed", value: summary.confirmed },
                { icon: Stethoscope, label: "Specialties", value: summary.specialists },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-[24px] bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{value}</p>
                      <p className="text-sm text-slate-500">{label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </header>

        <AppointmentsCalendar appointments={appointments} providers={providers} onAppointmentsChange={setAppointments} />

        <Card className="rounded-[28px]">
          <CardHeader>
            <CardDescription>Upcoming visits</CardDescription>
            <CardTitle>Appointment list</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onView={setSelectedAppointment}
                onCancel={handleCancel}
              />
            ))}
          </CardContent>
        </Card>

        {selectedAppointment ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-xl rounded-[28px] shadow-xl">
              <CardHeader>
                <CardDescription>Quick review</CardDescription>
                <CardTitle className="mt-1 text-2xl">{selectedAppointment.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-slate-600">{selectedAppointment.reason}</p>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <p><span className="font-medium text-slate-900">Date:</span> {selectedAppointment.dateLabel}</p>
                  <p className="mt-2"><span className="font-medium text-slate-900">Time:</span> {selectedAppointment.timeLabel}</p>
                  <p className="mt-2"><span className="font-medium text-slate-900">Provider:</span> {selectedAppointment.providerName}</p>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedAppointment(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    Close
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Appointments;
