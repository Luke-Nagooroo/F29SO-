import React, { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { appointmentsAPI } from "../../api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerInput } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

const BookAppointmentModal = ({
  isOpen,
  onClose,
  providers,
  prefillReason = "",
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    providerId: "",
    date: "",
    time: "",
    type: "consultation",
    reason: prefillReason,
  });
  const [error, setError] = useState("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        providerId: "",
        date: "",
        time: "",
        type: "consultation",
        reason: prefillReason,
      });
      setError("");
    }
  }, [isOpen, prefillReason]);

  // Fetch live availability when provider + date are selected
  const { data: availabilityData, isLoading: loadingSlots } = useQuery({
    queryKey: ["providerAvailability", formData.providerId, formData.date],
    queryFn: async () => {
      const response = await appointmentsAPI.getProviderAvailability(
        formData.providerId,
        formData.date,
      );
      return response.data.data;
    },
    enabled: !!formData.providerId && !!formData.date,
  });

  // Generate available time slots from provider availability, filtering out booked ones
  const availableSlots = useMemo(() => {
    if (!availabilityData) return [];

    const { provider, bookedSlots } = availabilityData;
    const dateObj = new Date(formData.date);
    const dayOfWeek = format(dateObj, "EEEE").toLowerCase();

    // Get provider's availability for this day of week
    const dayAvailability = provider?.availability?.find(
      (a) => a.day?.toLowerCase() === dayOfWeek,
    );

    // Default 9-5 if provider has no explicit availability
    const startHour = dayAvailability?.startTime
      ? parseInt(dayAvailability.startTime.split(":")[0], 10)
      : 9;
    const endHour = dayAvailability?.endTime
      ? parseInt(dayAvailability.endTime.split(":")[0], 10)
      : 17;

    // Generate 30-min slots
    const slots = [];
    for (let h = startHour; h < endHour; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
      slots.push(`${String(h).padStart(2, "0")}:30`);
    }

    // Filter out booked slots
    const bookedTimes = new Set(
      (bookedSlots || []).map((s) => format(new Date(s.scheduledAt), "HH:mm")),
    );

    // Also filter past times if booking for today
    const now = new Date();
    const isToday =
      format(dateObj, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");

    return slots.filter((slot) => {
      if (bookedTimes.has(slot)) return false;
      if (isToday) {
        const [h, m] = slot.split(":").map(Number);
        if (h < now.getHours() || (h === now.getHours() && m <= now.getMinutes()))
          return false;
      }
      return true;
    });
  }, [availabilityData, formData.date]);

  const bookMutation = useMutation({
    mutationFn: (data) => appointmentsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["providerPatients"] });
      onClose();
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Failed to book appointment");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.providerId || !formData.date || !formData.time) {
      setError("Please fill in all required fields");
      return;
    }
    if (!formData.reason.trim()) {
      setError("Please provide a reason for the visit");
      return;
    }

    // Combine date + time into ISO scheduledAt
    const [hours, minutes] = formData.time.split(":").map(Number);
    const scheduledAt = new Date(formData.date);
    scheduledAt.setHours(hours, minutes, 0, 0);

    bookMutation.mutate({
      providerId: formData.providerId,
      scheduledAt: scheduledAt.toISOString(),
      type: formData.type,
      reason: formData.reason.trim(),
      duration: 30,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-foreground">
            Book Appointment
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-2">Healthcare Provider *</Label>
            <Select
              value={formData.providerId}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  providerId: value,
                  time: "",
                }))
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {providers?.map((provider) => (
                  <SelectItem key={provider._id} value={provider._id}>
                    Dr. {provider.profile?.firstName}{" "}
                    {provider.profile?.lastName}
                    {provider.providerInfo?.specialization
                      ? ` - ${provider.providerInfo.specialization}`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <DatePickerInput
              label="Date *"
              onValueChange={(details) => {
                const dateStr = details.valueAsString[0] || "";
                setFormData((prev) => ({ ...prev, date: dateStr, time: "" }));
              }}
              isDateUnavailable={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const d = new Date(date.year, date.month - 1, date.day);
                return d < today;
              }}
            />
          </div>

          <div>
            <Label className="mb-2">Time *</Label>
            {formData.providerId && formData.date ? (
              loadingSlots ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  Loading available slots...
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No available slots for this date. Try another day.
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, time: slot }))
                      }
                      className={cn(
                        "px-2 py-2 text-sm rounded-lg border transition-colors",
                        formData.time === slot
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary/50 hover:bg-primary/5 text-foreground",
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )
            ) : (
              <p className="text-sm text-muted-foreground py-2">
                Select a provider and date first
              </p>
            )}
          </div>

          <div>
            <Label className="mb-2">Appointment Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="follow-up">Follow Up</SelectItem>
                <SelectItem value="routine-checkup">
                  Routine Checkup
                </SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2">Reason for Visit *</Label>
            <textarea
              value={formData.reason}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reason: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="Describe your symptoms or reason for the appointment..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={bookMutation.isPending || !formData.time}
              className="flex-1"
            >
              {bookMutation.isPending ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointmentModal;
