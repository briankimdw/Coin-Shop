"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FaSpinner,
  FaSave,
  FaPhone,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaEnvelope,
  FaCog,
  FaChevronDown,
  FaChevronUp,
  FaTrash,
  FaPlus,
  FaTimes,
  FaSearch,
} from "react-icons/fa";
import { format } from "date-fns";

interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  type: string;
  status: string;
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentSettings {
  slotDurationMin: number;
  maxPerSlot: number;
  advanceBookDays: number;
  appointmentTypes: string[];
  blockedDates: string[];
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600 ring-1 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",
  completed: "bg-blue-50 text-blue-600 ring-1 ring-blue-200",
  cancelled: "bg-red-50 text-red-500 ring-1 ring-red-200",
};

const statusOptions = ["pending", "confirmed", "completed", "cancelled"];

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppointmentSettings>({
    slotDurationMin: 30,
    maxPerSlot: 1,
    advanceBookDays: 30,
    appointmentTypes: [],
    blockedDates: [],
  });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [newType, setNewType] = useState("");
  const [newBlockedDate, setNewBlockedDate] = useState("");

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilter !== "all") params.set("status", activeFilter);

      const res = await fetch(`/api/admin/appointments?${params.toString()}`);
      const data = await res.json();
      const items: Appointment[] = data.appointments || [];
      setAppointments(items);
      setStatusCounts(data.statusCounts || {});

      const notesMap: Record<string, string> = {};
      const statusMap: Record<string, string> = {};
      items.forEach((item) => {
        notesMap[item.id] = item.adminNotes || "";
        statusMap[item.id] = item.status;
      });
      setAdminNotes(notesMap);
      setStatuses(statusMap);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  const fetchSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch("/api/admin/appointments/settings");
      const data = await res.json();
      setSettings({
        slotDurationMin: data.slotDurationMin || 30,
        maxPerSlot: data.maxPerSlot || 1,
        advanceBookDays: data.advanceBookDays || 30,
        appointmentTypes: data.appointmentTypes || [],
        blockedDates: data.blockedDates || [],
      });
    } catch {
      // Use defaults
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    if (showSettings) fetchSettings();
  }, [showSettings]);

  const handleSave = async (id: string) => {
    setSavingId(id);
    try {
      await fetch(`/api/admin/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statuses[id],
          adminNotes: adminNotes[id],
        }),
      });
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: statuses[id], adminNotes: adminNotes[id] }
            : item
        )
      );
    } catch {
      alert("Failed to save changes");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/appointments/${id}`, { method: "DELETE" });
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch {
      alert("Failed to delete appointment");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/appointments/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.appointmentTypes) {
        setSettings((prev) => ({
          ...prev,
          appointmentTypes: data.appointmentTypes,
          blockedDates: data.blockedDates,
        }));
      }
    } catch {
      alert("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const addType = () => {
    const trimmed = newType.trim();
    if (trimmed && !settings.appointmentTypes.includes(trimmed)) {
      setSettings((prev) => ({
        ...prev,
        appointmentTypes: [...prev.appointmentTypes, trimmed],
      }));
      setNewType("");
    }
  };

  const removeType = (type: string) => {
    setSettings((prev) => ({
      ...prev,
      appointmentTypes: prev.appointmentTypes.filter((t) => t !== type),
    }));
  };

  const addBlockedDate = () => {
    if (newBlockedDate && !settings.blockedDates.includes(newBlockedDate)) {
      setSettings((prev) => ({
        ...prev,
        blockedDates: [...prev.blockedDates, newBlockedDate].sort(),
      }));
      setNewBlockedDate("");
    }
  };

  const removeBlockedDate = (date: string) => {
    setSettings((prev) => ({
      ...prev,
      blockedDates: prev.blockedDates.filter((d) => d !== date),
    }));
  };

  // Filter appointments
  const todaysAppointments = appointments.filter((a) => a.date === todayStr);
  const filteredAppointments = appointments.filter((a) =>
    searchQuery
      ? a.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const totalCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Appointments</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {totalCount} total appointment{totalCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Today's Appointments */}
      {todaysAppointments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FaCalendarAlt className="text-[#C9A84C]" />
            Today&apos;s Appointments
          </h2>
          <div className="space-y-2">
            {todaysAppointments.map((appt) => (
              <div
                key={`today-${appt.id}`}
                className="bg-white rounded-xl border-2 border-amber-300 p-4 flex items-center justify-between flex-wrap gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#1B2A4A] flex items-center justify-center flex-shrink-0">
                    <FaUser className="text-[#C9A84C] text-sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{appt.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <FaClock className="text-xs" /> {appt.timeSlot}
                      </span>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-[#1B2A4A]/10 text-[#1B2A4A]">
                        {appt.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${appt.phone}`}
                    className="text-[#C9A84C] hover:text-[#b8963e] transition-colors flex items-center gap-1 text-sm"
                  >
                    <FaPhone className="text-xs" /> {appt.phone}
                  </a>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                      statusColors[appt.status] || statusColors.pending
                    }`}
                  >
                    {appt.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-0.5 mb-4 bg-gray-100 p-0.5 rounded-lg w-fit">
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "confirmed", label: "Confirmed" },
          { key: "completed", label: "Completed" },
          { key: "cancelled", label: "Cancelled" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveFilter(tab.key);
              setExpandedId(null);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeFilter === tab.key
                ? "bg-white text-[#1B2A4A] shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
            {tab.key !== "all" && statusCounts[tab.key] ? (
              <span className="ml-1 text-xs opacity-60">({statusCounts[tab.key]})</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-72 pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none transition-colors"
        />
      </div>

      {/* Appointment list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <FaSpinner className="animate-spin text-3xl text-[#C9A84C]" />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <FaCalendarAlt className="text-5xl mx-auto mb-4 text-gray-200" />
            <p className="text-gray-500 font-medium">No appointments found</p>
          </div>
        ) : (
          filteredAppointments.map((appt) => {
            const isExpanded = expandedId === appt.id;
            const currentStatus = statuses[appt.id] || appt.status;

            return (
              <div
                key={appt.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all"
              >
                {/* Header row */}
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : appt.id)
                  }
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#1B2A4A] flex items-center justify-center flex-shrink-0">
                      <FaUser className="text-[#C9A84C] text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {appt.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                        <span>{appt.date}</span>
                        <span>&middot;</span>
                        <span>{appt.timeSlot}</span>
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-[#1B2A4A]/10 text-[#1B2A4A]">
                          {appt.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <a
                      href={`tel:${appt.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#C9A84C] hover:text-[#b8963e] transition-colors hidden sm:flex items-center gap-1 text-sm"
                    >
                      <FaPhone className="text-xs" /> {appt.phone}
                    </a>
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        statusColors[currentStatus] || statusColors.pending
                      }`}
                    >
                      {currentStatus.toUpperCase()}
                    </span>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-5">
                    {/* Contact info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaEnvelope className="text-[#C9A84C]" />
                        <a
                          href={`mailto:${appt.email}`}
                          className="hover:text-[#C9A84C] transition-colors"
                        >
                          {appt.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaPhone className="text-[#C9A84C]" />
                        <a
                          href={`tel:${appt.phone}`}
                          className="hover:text-[#C9A84C] transition-colors"
                        >
                          {appt.phone}
                        </a>
                      </div>
                      <div className="text-sm text-gray-500">
                        Booked:{" "}
                        {appt.createdAt
                          ? format(
                              new Date(appt.createdAt),
                              "MMM d, yyyy 'at' h:mm a"
                            )
                          : "--"}
                      </div>
                    </div>

                    {/* Customer notes */}
                    {appt.notes && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                          Customer Notes
                        </label>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                          {appt.notes}
                        </p>
                      </div>
                    )}

                    <hr className="border-gray-200" />

                    {/* Status & admin notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                          Status
                        </label>
                        <select
                          value={currentStatus}
                          onChange={(e) =>
                            setStatuses((prev) => ({
                              ...prev,
                              [appt.id]: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none transition-colors"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                        Admin Notes
                      </label>
                      <textarea
                        value={adminNotes[appt.id] || ""}
                        onChange={(e) =>
                          setAdminNotes((prev) => ({
                            ...prev,
                            [appt.id]: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none transition-colors resize-none"
                        placeholder="Internal notes about this appointment..."
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSave(appt.id)}
                        disabled={savingId === appt.id}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] hover:bg-[#b8963e] text-white rounded-lg transition-all font-medium disabled:opacity-60 shadow-sm hover:shadow-md"
                      >
                        {savingId === appt.id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaSave />
                        )}
                        Save Changes
                      </button>
                      <button
                        onClick={() => handleDelete(appt.id)}
                        disabled={deletingId === appt.id}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all font-medium disabled:opacity-60 text-sm"
                      >
                        {deletingId === appt.id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTrash />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Settings Section */}
      <div className="mt-10">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <FaCog className="text-[#C9A84C]" />
          Appointment Settings
          {showSettings ? (
            <FaChevronUp className="text-xs" />
          ) : (
            <FaChevronDown className="text-xs" />
          )}
        </button>

        {showSettings && (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            {loadingSettings ? (
              <div className="flex justify-center py-8">
                <FaSpinner className="animate-spin text-[#C9A84C] text-2xl" />
              </div>
            ) : (
              <>
                {/* Basic settings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                      Slot Duration (min)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={120}
                      value={settings.slotDurationMin}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          slotDurationMin: parseInt(e.target.value) || 30,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                      Max Per Slot
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={settings.maxPerSlot}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          maxPerSlot: parseInt(e.target.value) || 1,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                      Advance Booking Days
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={settings.advanceBookDays}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          advanceBookDays: parseInt(e.target.value) || 30,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Appointment Types */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                    Appointment Types
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {settings.appointmentTypes.map((type) => (
                      <span
                        key={type}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B2A4A]/10 text-[#1B2A4A] rounded-full text-sm font-medium"
                      >
                        {type}
                        <button
                          onClick={() => removeType(type)}
                          className="text-[#1B2A4A]/40 hover:text-red-500 transition-colors"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addType()}
                      placeholder="Add appointment type..."
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none transition-colors"
                    />
                    <button
                      onClick={addType}
                      className="px-3 py-2 bg-[#1B2A4A] text-white rounded-lg hover:bg-[#1B2A4A]/90 transition-colors"
                    >
                      <FaPlus className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* Blocked Dates */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                    Blocked Dates
                  </label>
                  {settings.blockedDates.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {settings.blockedDates.map((date) => (
                        <span
                          key={date}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium"
                        >
                          {date}
                          <button
                            onClick={() => removeBlockedDate(date)}
                            className="text-red-300 hover:text-red-500 transition-colors"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={newBlockedDate}
                      onChange={(e) => setNewBlockedDate(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] outline-none transition-colors"
                    />
                    <button
                      onClick={addBlockedDate}
                      disabled={!newBlockedDate}
                      className="px-3 py-2 bg-[#1B2A4A] text-white rounded-lg hover:bg-[#1B2A4A]/90 transition-colors disabled:opacity-40"
                    >
                      <FaPlus className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* Save settings button */}
                <button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] hover:bg-[#b8963e] text-white rounded-lg transition-all font-medium disabled:opacity-60 shadow-sm hover:shadow-md"
                >
                  {savingSettings ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaSave />
                  )}
                  Save Settings
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
