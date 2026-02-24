import React, { useMemo, useState } from "react";
import { CalendarDays, LayoutDashboard, Users } from "lucide-react";
import OverviewTab from "../components/provider/OverviewTab";
import PatientsTab from "../components/provider/PatientsTab";
import CalendarTab from "../components/provider/CalendarTab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

const samplePatients = [
  {
    id: "pt-1",
    fullName: "Ayesha Khan",
    age: 29,
    condition: "Hypertension follow-up",
    email: "ayesha@example.com",
    bloodType: "A+",
    recentMetric: { label: "Blood pressure", value: "122 / 78 mmHg" },
    lastVisit: "Today, 9:00 AM",
    notes: "Symptoms improving. Continue weekly logging for now.",
  },
  {
    id: "pt-2",
    fullName: "Hassan Ali",
    age: 41,
    condition: "Recovery monitoring",
    email: "hassan@example.com",
    bloodType: "O+",
    recentMetric: { label: "Heart rate", value: "74 bpm" },
    lastVisit: "Yesterday",
    notes: "Review hydration reminders and daily activity trends next visit.",
  },
  {
    id: "pt-3",
    fullName: "Mariam Raza",
    age: 35,
    condition: "Diabetes check-in",
    email: "mariam@example.com",
    bloodType: "B+",
    recentMetric: { label: "Blood glucose", value: "108 mg/dL" },
    lastVisit: "2 days ago",
    notes: "Patient is tracking meals consistently. Medication module comes later.",
  },
  {
    id: "pt-4",
    fullName: "Usman Tariq",
    age: 52,
    condition: "Cardiac wellness",
    email: "usman@example.com",
    bloodType: "AB-",
    recentMetric: { label: "Steps", value: "6.1k today" },
    lastVisit: "This week",
    notes: "Needs stronger adherence prompts after wearables are fully connected.",
  },
];

const todayAppointments = [
  { id: "apt-1", time: "09:00 AM", patient: "Ayesha Khan", type: "Follow-up", status: "Confirmed" },
  { id: "apt-2", time: "11:30 AM", patient: "Hassan Ali", type: "Consultation", status: "Waiting" },
  { id: "apt-3", time: "02:15 PM", patient: "Mariam Raza", type: "Review", status: "Scheduled" },
];

const priorityAlerts = [
  { id: "alert-1", title: "High evening blood pressure", severity: "high", detail: "Ayesha logged two elevated readings in the last 24 hours." },
  { id: "alert-2", title: "Missed recovery check-in", severity: "medium", detail: "Hassan skipped the morning symptom note placeholder flow." },
  { id: "alert-3", title: "Glucose trend needs review", severity: "low", detail: "Mariam shows slight variance compared with the prior week." },
];

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "patients", label: "Patients", icon: Users },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
];

function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const providerSnapshot = useMemo(
    () => ({
      appointmentsToday: todayAppointments.length,
      patientsCount: samplePatients.length,
      unreadMessages: 6,
      activeAlerts: priorityAlerts.length,
    }),
    [],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Provider workspace</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Manage patients, visits, and your daily care flow</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                The provider dashboard is now moving beyond placeholders. Overview, patient management, and calendar scheduling can all be explored as separate tabs, while messaging and alerts can land in later commits.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {[
                { label: "Today's visits", value: providerSnapshot.appointmentsToday },
                { label: "Patients", value: providerSnapshot.patientsCount },
                { label: "Unread messages", value: providerSnapshot.unreadMessages },
                { label: "Active alerts", value: providerSnapshot.activeAlerts },
              ].map((item) => (
                <div key={item.label} className="rounded-[24px] bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <section className="mb-8 flex flex-wrap gap-3">
          {tabs.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeTab === id ? "default" : "outline"}
              onClick={() => setActiveTab(id)}
              className="rounded-full"
            >
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </Button>
          ))}
        </section>

        <Card className="rounded-[32px]">
          <CardHeader>
            <CardDescription>Provider dashboard</CardDescription>
            <CardTitle>
              {activeTab === "overview" ? "Overview and quick review" : activeTab === "patients" ? "Patient management" : "Calendar and scheduling"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === "overview" ? (
              <OverviewTab
                appointments={todayAppointments}
                alerts={priorityAlerts}
                patients={samplePatients}
                unreadMessages={providerSnapshot.unreadMessages}
                onOpenPatients={() => setActiveTab("patients")}
              />
            ) : null}

            {activeTab === "patients" ? <PatientsTab patients={samplePatients} /> : null}
            {activeTab === "calendar" ? <CalendarTab /> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProviderDashboard;
