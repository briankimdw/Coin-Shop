import type { Metadata } from "next";
import AppointmentBooking from "@/components/AppointmentBooking";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Schedule an appointment for coin appraisals, selling, buying consultations, collection reviews, and estate evaluations.",
};

export default function AppointmentsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Banner */}
      <section className="page-hero py-16 md:py-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-widest mb-3">Schedule a Visit</p>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Book an Appointment
          </h1>
          <p className="text-[#FAF7F0]/60 text-lg max-w-2xl mx-auto">
            Schedule a visit for appraisals, selling, buying consultations, and
            more. We look forward to seeing you!
          </p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AppointmentBooking />
        </div>
      </section>
    </div>
  );
}
