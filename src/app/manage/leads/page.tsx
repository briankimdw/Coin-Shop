"use client";

import { useEffect, useState } from "react";
import {
  FaSpinner,
  FaPlus,
  FaTimes,
  FaPhone,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaTrash,
  FaEdit,
  FaSave,
} from "react-icons/fa";

interface Lead {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  webStatus: string;
  rating: number | null;
  reviews: number;
  mapsUrl: string;
  notes: string;
  status: string;
  contactedAt: string | null;
  createdAt: string;
}

const statusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "not_interested", label: "Not Interested" },
  { value: "client", label: "Client" },
];

const webStatusOptions = [
  { value: "all", label: "All Web Status" },
  { value: "NO WEBSITE", label: "No Website" },
  { value: "Facebook Only", label: "Facebook Only" },
  { value: "Yelp Only", label: "Yelp Only" },
  { value: "Has Website", label: "Has Website" },
];

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  interested: "bg-purple-100 text-purple-800",
  not_interested: "bg-gray-200 text-gray-600",
  client: "bg-teal-100 text-teal-800",
};

const webStatusColors: Record<string, string> = {
  "NO WEBSITE": "bg-red-100 text-red-700",
  "Facebook Only": "bg-yellow-100 text-yellow-700",
  "Yelp Only": "bg-yellow-100 text-yellow-700",
  "Yellow Pages Only": "bg-yellow-100 text-yellow-700",
  "BBB Only": "bg-yellow-100 text-yellow-700",
  "Has Website": "bg-green-100 text-green-700",
  unknown: "bg-gray-100 text-gray-600",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterWeb, setFilterWeb] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", address: "", phone: "", website: "", notes: "", status: "new" });

  const fetchLeads = () => {
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (filterWeb !== "all") params.set("webStatus", filterWeb);
    if (search) params.set("search", search);

    fetch(`/api/manage/leads?${params}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setLeads(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeads();
  }, [filterStatus, filterWeb]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchLeads();
  };

  const resetForm = () => {
    setForm({ name: "", address: "", phone: "", website: "", notes: "", status: "new" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/manage/leads/${editingId}` : "/api/manage/leads";
    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    resetForm();
    setLoading(true);
    fetchLeads();
  };

  const handleEdit = (lead: Lead) => {
    setForm({
      name: lead.name,
      address: lead.address,
      phone: lead.phone,
      website: lead.website,
      notes: lead.notes,
      status: lead.status,
    });
    setEditingId(lead.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    await fetch(`/api/manage/leads/${id}`, { method: "DELETE" });
    setLeads(leads.filter((l) => l.id !== id));
  };

  const handleQuickStatus = async (id: string, status: string) => {
    await fetch(`/api/manage/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(true);
    fetchLeads();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leads ({leads.length})</h1>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
        >
          {showForm ? <FaTimes /> : <FaPlus />}
          {showForm ? "Cancel" : "Add Lead"}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setLoading(true); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Website</label>
            <select
              value={filterWeb}
              onChange={(e) => { setFilterWeb(e.target.value); setLoading(true); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              {webStatusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, address, phone..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <button type="submit" className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-800">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">{editingId ? "Edit Lead" : "Add New Lead"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Business Name *"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Address"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="Website"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <div className="flex gap-2">
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">
              <FaSave /> {editingId ? "Update" : "Save"}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Leads List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <FaSpinner className="animate-spin text-2xl text-teal-600" />
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-400">
          No leads found. Try the scraper to find coin shops.
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[lead.status] || ""}`}>
                      {lead.status.replace("_", " ")}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${webStatusColors[lead.webStatus] || webStatusColors.unknown}`}>
                      {lead.webStatus}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                    {lead.address && (
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-xs" /> {lead.address}
                      </span>
                    )}
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-teal-600 hover:text-teal-700">
                        <FaPhone className="text-xs" /> {lead.phone}
                      </a>
                    )}
                    {lead.rating && (
                      <span>{lead.rating} stars ({lead.reviews} reviews)</span>
                    )}
                  </div>
                  {lead.notes && (
                    <p className="text-sm text-gray-400 mt-1 italic">{lead.notes}</p>
                  )}
                  {lead.contactedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Contacted: {new Date(lead.contactedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {lead.mapsUrl && (
                    <a
                      href={lead.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-teal-600"
                      title="Google Maps"
                    >
                      <FaExternalLinkAlt />
                    </a>
                  )}
                  {lead.status === "new" && (
                    <button
                      onClick={() => handleQuickStatus(lead.id, "contacted")}
                      className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs hover:bg-yellow-200"
                    >
                      Mark Contacted
                    </button>
                  )}
                  {lead.status === "contacted" && (
                    <button
                      onClick={() => handleQuickStatus(lead.id, "interested")}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs hover:bg-purple-200"
                    >
                      Interested
                    </button>
                  )}
                  <button onClick={() => handleEdit(lead)} className="p-2 text-gray-400 hover:text-teal-600">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(lead.id)} className="p-2 text-gray-400 hover:text-red-500">
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
