"use client";

import { useState, useEffect, useCallback } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isBefore,
  startOfDay,
  addDays,
  isSameDay,
} from "date-fns";
import { FaChevronLeft, FaChevronRight, FaSpinner, FaCheckCircle } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface Slot {
  time: string;
  available: number;
  total: number;
}

interface SlotResponse {
  slots: Slot[];
  appointmentTypes: string[];
  closed: boolean;
}

interface MonthAvailability {
  [date: string]: { allFull: boolean; closed: boolean };
}

export default function AppointmentBooking() {
  const today = startOfDay(new Date());
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [step, setStep] = useState(1);
  const [advanceBookDays, setAdvanceBookDays] = useState(30);
  const [monthAvailability, setMonthAvailability] = useState<MonthAvailability>({});
  const [loadingMonth, setLoadingMonth] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Confirmation state
  const [confirmedDate, setConfirmedDate] = useState("");
  const [confirmedSlot, setConfirmedSlot] = useState("");
  const [confirmedType, setConfirmedType] = useState("");

  const maxDate = addDays(today, advanceBookDays);

  const fetchMonthAvailability = useCallback(async (month: Date) => {
    setLoadingMonth(true);
    const days = eachDayOfInterval({
      start: startOfMonth(month),
      end: endOfMonth(month),
    });

    const availability: MonthAvailability = {};

    const promises = days.map(async (day) => {
      if (isBefore(day, today) || isBefore(maxDate, day)) {
        return;
      }
      const dateStr = format(day, "yyyy-MM-dd");
      try {
        const res = await fetch(`/api/appointments?date=${dateStr}`);
        const data: SlotResponse = await res.json();
        if (data.closed) {
          availability[dateStr] = { allFull: false, closed: true };
        } else {
          const allFull = data.slots.length > 0 && data.slots.every((s) => s.available === 0);
          availability[dateStr] = { allFull, closed: false };
        }
        if (data.appointmentTypes?.length > 0) {
          setAppointmentTypes(data.appointmentTypes);
        }
      } catch {
        // Ignore errors for individual days
      }
    });

    await Promise.all(promises);
    setMonthAvailability((prev) => ({ ...prev, ...availability }));
    setLoadingMonth(false);
  }, [today, maxDate]);

  useEffect(() => {
    fetchMonthAvailability(currentMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/appointments/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.advanceBookDays) {
            setAdvanceBookDays(data.advanceBookDays);
          }
        }
      } catch {
        // Use default
      }
    }
    fetchSettings();
  }, []);

  const fetchSlots = async (date: Date) => {
    setLoadingSlots(true);
    const dateStr = format(date, "yyyy-MM-dd");
    try {
      const res = await fetch(`/api/appointments?date=${dateStr}`);
      const data: SlotResponse = await res.json();
      setSlots(data.slots);
      if (data.appointmentTypes?.length > 0) {
        setAppointmentTypes(data.appointmentTypes);
        if (!selectedType && data.appointmentTypes.length > 0) {
          setSelectedType(data.appointmentTypes[0]);
        }
      }
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    fetchSlots(date);
    setStep(2);
  };

  const handleSlotSelect = (time: string) => {
    setSelectedSlot(time);
  };

  const handleContinueToForm = () => {
    if (selectedSlot && selectedType) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot || !selectedType) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          phone: formPhone,
          date: format(selectedDate, "yyyy-MM-dd"),
          timeSlot: selectedSlot,
          type: selectedType,
          notes: formNotes || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setConfirmedDate(format(selectedDate, "EEEE, MMMM d, yyyy"));
        setConfirmedSlot(selectedSlot);
        setConfirmedType(selectedType);
        setStep(4);
      } else {
        setSubmitError(data.error || "Failed to book appointment");
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookAnother = () => {
    setStep(1);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSelectedType(appointmentTypes[0] || "");
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormNotes("");
    setSubmitError("");
  };

  // Calendar rendering
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const canGoPrev = !isBefore(startOfMonth(subMonths(currentMonth, 1)), startOfMonth(today));

  const inputClasses = "w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-[#1B2A4A] focus:border-[#C9A84C] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.1)] outline-none transition-all duration-300";

  return (
    <div>
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                step >= s
                  ? "bg-gradient-to-br from-[#C9A84C] to-[#B8942E] text-white shadow-md shadow-[#C9A84C]/20"
                  : "bg-gray-100 text-gray-400"
              )}
            >
              {s === 4 && step === 4 ? (
                <FaCheckCircle className="text-sm" />
              ) : (
                s
              )}
            </div>
            {s < 4 && (
              <div
                className={cn(
                  "w-14 h-[2px] transition-colors duration-300",
                  step > s ? "bg-[#C9A84C]" : "bg-gray-100"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Calendar */}
      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--border)] p-7">
          <h2 className="font-serif text-xl font-bold text-[#1B2A4A] mb-5 text-center">
            Select a Date
          </h2>

          {/* Month navigation */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => canGoPrev && setCurrentMonth(subMonths(currentMonth, 1))}
              disabled={!canGoPrev}
              className="p-2.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            >
              <FaChevronLeft className="text-[#1B2A4A]" />
            </button>
            <h3 className="font-serif font-bold text-[#1B2A4A] text-lg">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <FaChevronRight className="text-[#1B2A4A]" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider py-2"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 relative">
            {loadingMonth && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-lg backdrop-blur-sm">
                <FaSpinner className="animate-spin text-[#C9A84C] text-2xl" />
              </div>
            )}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {calendarDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const isPast = isBefore(day, today);
              const isBeyondMax = isBefore(maxDate, day);
              const availability = monthAvailability[dateStr];
              const isClosed = availability?.closed;
              const isFull = availability?.allFull;
              const isDisabled = isPast || isBeyondMax || isClosed || isFull;
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, today);

              return (
                <button
                  key={dateStr}
                  onClick={() => !isDisabled && handleDateClick(day)}
                  disabled={isDisabled}
                  className={cn(
                    "aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all duration-300 relative",
                    isSelected
                      ? "bg-gradient-to-br from-[#C9A84C] to-[#B8942E] text-white font-bold shadow-lg shadow-[#C9A84C]/20"
                      : isDisabled
                      ? "text-gray-300 cursor-not-allowed"
                      : "hover:bg-[#C9A84C]/10 text-[#1B2A4A] font-medium cursor-pointer",
                    isToday && !isSelected ? "ring-2 ring-[#C9A84C] ring-inset" : ""
                  )}
                >
                  <span>{format(day, "d")}</span>
                  {isClosed && !isPast && !isBeyondMax && (
                    <span className="text-[9px] text-gray-400 leading-none mt-0.5">
                      Closed
                    </span>
                  )}
                  {isFull && !isClosed && !isPast && !isBeyondMax && (
                    <span className="text-[9px] text-red-400 leading-none mt-0.5 font-bold">
                      Full
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Time & Type Selection */}
      {step === 2 && (
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--border)] p-7">
          <button
            onClick={() => setStep(1)}
            className="text-sm text-[#C9A84C] hover:text-[#B8942E] font-semibold mb-5 inline-flex items-center gap-1.5 transition-colors duration-300"
          >
            <span>&larr;</span> Back to calendar
          </button>

          <h2 className="font-serif text-xl font-bold text-[#1B2A4A] mb-1">
            Select Time & Type
          </h2>
          {selectedDate && (
            <p className="text-gray-400 mb-7 text-sm">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </p>
          )}

          {loadingSlots ? (
            <div className="flex justify-center py-14">
              <FaSpinner className="animate-spin text-[#C9A84C] text-2xl" />
            </div>
          ) : (
            <>
              {/* Time Slots */}
              <div className="mb-7">
                <label className="block text-sm font-bold text-[#1B2A4A] mb-3">
                  Available Times
                </label>
                {slots.length === 0 ? (
                  <p className="text-gray-400 text-sm bg-gray-50 rounded-lg p-4 text-center">
                    No time slots available for this date.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {slots.map((slot) => {
                      const isAvailable = slot.available > 0;
                      const isSelected = selectedSlot === slot.time;
                      return (
                        <button
                          key={slot.time}
                          onClick={() => isAvailable && handleSlotSelect(slot.time)}
                          disabled={!isAvailable}
                          className={cn(
                            "py-3 px-3 rounded-lg text-sm font-medium transition-all duration-300 border",
                            isSelected
                              ? "bg-gradient-to-br from-[#C9A84C] to-[#B8942E] text-white border-[#C9A84C] shadow-md shadow-[#C9A84C]/20"
                              : isAvailable
                              ? "border-gray-200 text-[#1B2A4A] hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/5"
                              : "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50"
                          )}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Appointment Type */}
              <div className="mb-7">
                <label className="block text-sm font-bold text-[#1B2A4A] mb-3">
                  Appointment Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {appointmentTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={cn(
                        "py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 border text-left",
                        selectedType === type
                          ? "bg-gradient-to-br from-[#C9A84C] to-[#B8942E] text-white border-[#C9A84C] shadow-md shadow-[#C9A84C]/20"
                          : "border-gray-200 text-[#1B2A4A] hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/5"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleContinueToForm}
                disabled={!selectedSlot || !selectedType}
                className="w-full py-3.5 rounded-lg bg-gradient-to-r from-[#C9A84C] to-[#B8942E] text-white font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-lg hover:shadow-[#C9A84C]/25 hover:-translate-y-0.5 disabled:hover:translate-y-0"
              >
                Continue
              </button>
            </>
          )}
        </div>
      )}

      {/* Step 3: Contact Info */}
      {step === 3 && (
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--border)] p-7">
          <button
            onClick={() => setStep(2)}
            className="text-sm text-[#C9A84C] hover:text-[#B8942E] font-semibold mb-5 inline-flex items-center gap-1.5 transition-colors duration-300"
          >
            <span>&larr;</span> Back to time selection
          </button>

          <h2 className="font-serif text-xl font-bold text-[#1B2A4A] mb-1">
            Your Information
          </h2>
          <p className="text-gray-400 mb-7 text-sm">
            {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")} &middot;{" "}
            {selectedSlot} &middot; {selectedType}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#1B2A4A] mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className={inputClasses}
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1B2A4A] mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className={inputClasses}
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1B2A4A] mb-1.5">
                Phone <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                required
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className={inputClasses}
                placeholder="(555) 555-5555"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1B2A4A] mb-1.5">
                Notes <span className="text-gray-400 font-normal text-xs">(optional)</span>
              </label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={3}
                className={cn(inputClasses, "resize-none")}
                placeholder="Tell us what you'd like to discuss or any items you're bringing in..."
              />
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-lg bg-gradient-to-r from-[#C9A84C] to-[#B8942E] text-white font-semibold transition-all duration-300 disabled:opacity-60 shadow-sm hover:shadow-lg hover:shadow-[#C9A84C]/25 hover:-translate-y-0.5 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Booking...
                </>
              ) : (
                "Book Appointment"
              )}
            </button>
          </form>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--border)] p-10 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <FaCheckCircle className="text-green-500 text-3xl" />
          </div>

          <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] mb-2">
            Appointment Booked!
          </h2>
          <p className="text-gray-400 mb-8">
            Your appointment has been submitted successfully.
          </p>

          <div className="bg-[var(--surface-alt)] rounded-xl p-6 mb-8 inline-block text-left mx-auto border border-[var(--border)]">
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="font-bold text-[#1B2A4A] w-12">Date:</span>
                <span className="text-gray-600">{confirmedDate}</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-[#1B2A4A] w-12">Time:</span>
                <span className="text-gray-600">{confirmedSlot}</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-[#1B2A4A] w-12">Type:</span>
                <span className="text-gray-600">{confirmedType}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-400 mb-8">
            We&apos;ll give you a call to confirm your appointment. If you need
            to make changes, please contact us directly.
          </p>

          <button
            onClick={handleBookAnother}
            className="px-8 py-3.5 rounded-lg border-2 border-[#C9A84C] text-[#C9A84C] font-semibold hover:bg-[#C9A84C] hover:text-white transition-all duration-300 hover:-translate-y-0.5"
          >
            Book Another Appointment
          </button>
        </div>
      )}
    </div>
  );
}
