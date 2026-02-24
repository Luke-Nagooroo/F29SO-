import React, { useMemo, useState } from "react";
import AppointmentsCalendar from "../appointments/AppointmentsCalendar";
import AppointmentDetailModal from "./AppointmentDetailModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

const sampleProviders = [
  { id: "prov-1", name: "Dr. Sana Ahmed", specialty: "Cardiology", slots: ["09:00", "10:30", "01:00", "03:30"] },
  { id: "prov-2", name: "Dr. Hamza Rauf", specialty: "General Medicine", slots: ["08:30", "11:00", "02:00", "04:00"] },
];

const initialAppointments = [
  {
    id: "apt-provider-1",
    title: "Ayesha Khan review",
    patientName: "Ayesha Khan",
    providerName: "Dr. Sana Ahmed",
    specialty: "Cardiology",
    type: "Follow-up",
    status: "confirmed",
    date: new Date().toISOString().split("T")[0],
    dateLabel: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    time: "09:30",
    timeLabel: "09:30",
    reason: "Discuss recent blood pressure entries and review adherence notes.",
    subtitle: "Patient follow-up",
  },
  {
    id: "apt-provider-2",
    title: "Mariam Raza intake",
    patientName: "Mariam Raza",
    providerName: "Dr. Hamza Rauf",
    specialty: "General Medicine",
    type: "Consultation",
    status: "scheduled",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    dateLabel: new Date(Date.now() + 86400000).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    time: "11:00",
    timeLabel: "11:00",
    reason: "Initial check-in for fatigue and hydration tracking.",
    subtitle: "New patient",
  },
];

function CalendarTab() {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const stats = useMemo(() => {
    const scheduled = appointments.filter((item) => item.status !== "cancelled");
    return {
      total: appointments.length,
      today: appointments.filter((item) => item.date === new Date().toISOString().split("T")[0]).length,
      confirmed: appointments.filter((item) => item.status === "confirmed").length,
      upcoming: scheduled.length,
    };
  }, [appointments]);

  const handleCancel = (target) => {
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === target.id ? { ...appointment, status: "cancelled" } : appointment,
      ),
    );
    setSelectedAppointment((current) => (current?.id === target.id ? { ...current, status: "cancelled" } : current));
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total appointments", value: stats.total },
          { label: "Today", value: stats.today },
          { label: "Confirmed", value: stats.confirmed },
          { label: "Upcoming", value: stats.upcoming },
        ].map((item) => (
          <Card key={item.label} className="rounded-[24px]">
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="rounded-[28px]">
        <CardHeader>
          <CardDescription>Provider scheduling</CardDescription>
          <CardTitle>Calendar and appointment flow</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentsCalendar
            appointments={appointments}
            providers={sampleProviders}
            onAppointmentsChange={setAppointments}
            showPatientActions={false}
            onSelectAppointment={setSelectedAppointment}
          />
        </CardContent>
      </Card>

      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default CalendarTab;
