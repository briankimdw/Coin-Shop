import type { Metadata } from "next";
import AppointmentBooking from "@/components/AppointmentBooking";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Schedule an appointment for coin appraisals, selling, buying consultations, collection reviews, and estate evaluations.",
};

export default function AppointmentsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Banner */}
      <section className="bg-[#1B2A4A] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Book an Appointment
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
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
