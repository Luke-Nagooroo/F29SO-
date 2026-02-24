import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

const defaultForm = {
  providerId: "",
  type: "Consultation",
  date: "",
  time: "09:00",
  reason: "",
};

function BookAppointmentModal({ isOpen, onClose, providers = [], onSave, initialDate = "" }) {
  const [formData, setFormData] = useState(defaultForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setFormData((current) => ({ ...defaultForm, date: initialDate || current.date || "" }));
    setError("");
  }, [isOpen, initialDate]);

  const selectedProvider = useMemo(
    () => providers.find((provider) => provider.id === formData.providerId),
    [providers, formData.providerId],
  );

  const availableSlots = useMemo(() => {
    if (!selectedProvider) return ["09:00", "10:30", "12:00", "02:00", "04:00"];
    return selectedProvider.slots?.length ? selectedProvider.slots : ["09:00", "11:00", "01:30", "03:00"];
  }, [selectedProvider]);

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.providerId || !formData.date || !formData.time || !formData.reason.trim()) {
      setError("Please fill in the provider, date, time, and visit reason.");
      return;
    }

    const provider = providers.find((item) => item.id === formData.providerId);

    onSave?.({
      id: `apt-${Date.now()}`,
      title: provider ? `Appointment with ${provider.name}` : "Appointment",
      providerName: provider?.name || "Assigned provider",
      specialty: provider?.specialty || "General care",
      patientName: "Current patient",
      type: formData.type,
      status: "scheduled",
      date: formData.date,
      dateLabel: new Date(formData.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: formData.time,
      timeLabel: formData.time,
      reason: formData.reason.trim(),
      subtitle: "Booked from the early scheduling modal.",
    });

    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-xl rounded-[28px] border-slate-200 shadow-xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardDescription>Schedule a visit</CardDescription>
            <CardTitle className="mt-1 text-2xl">Book appointment</CardTitle>
          </div>
          <Button variant="ghost" onClick={onClose} className="h-10 w-10 rounded-full p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Provider
                <select
                  value={formData.providerId}
                  onChange={(event) => setFormData((current) => ({ ...current, providerId: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="">Select a provider</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name} · {provider.specialty}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                Visit type
                <select
                  value={formData.type}
                  onChange={(event) => setFormData((current) => ({ ...current, type: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                >
                  <option>Consultation</option>
                  <option>Follow-up</option>
                  <option>Vitals review</option>
                  <option>Care plan check-in</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Date
                <input
                  type="date"
                  value={formData.date}
                  onChange={(event) => setFormData((current) => ({ ...current, date: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                Time
                <select
                  value={formData.time}
                  onChange={(event) => setFormData((current) => ({ ...current, time: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                >
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Reason for visit
              <textarea
                value={formData.reason}
                onChange={(event) => setFormData((current) => ({ ...current, reason: event.target.value }))}
                placeholder="Describe the check-in, symptom, or review you want to discuss."
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
            </label>

            {selectedProvider ? (
              <div className="rounded-2xl bg-sky-50 p-4 text-sm text-sky-800">
                <p className="font-semibold text-sky-900">Selected provider</p>
                <p className="mt-1">{selectedProvider.name} · {selectedProvider.specialty}</p>
                <p className="mt-2 text-sky-700">This is still a first-pass scheduler. Availability and conflicts can be made smarter in later commits.</p>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button type="submit">Save appointment</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default BookAppointmentModal;
