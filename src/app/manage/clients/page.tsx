"use client";

import { useEffect, useState } from "react";
import {
  FaSpinner,
  FaPlus,
  FaTimes,
  FaEdit,
  FaTrash,
  FaSave,
  FaExternalLinkAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";

interface Client {
  id: string;
  shopName: string;
  ownerName: string;
  email: string;
  phone: string;
  domain: string;
  plan: string;
  status: string;
  monthlyRate: number;
  startDate: string | null;
  notes: string;
  createdAt: string;
}

const planOptions = [
  { value: "basic", label: "Basic" },
  { value: "pro", label: "Pro" },
  { value: "premium", label: "Premium" },
];

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  inactive: "bg-red-100 text-red-800",
};

const planColors: Record<string, string> = {
  basic: "bg-gray-100 text-gray-700",
  pro: "bg-blue-100 text-blue-700",
  premium: "bg-amber-100 text-amber-700",
};

const emptyForm = {
  shopName: "",
  ownerName: "",
  email: "",
  phone: "",
  domain: "",
  plan: "basic",
  status: "pending",
  monthlyRate: "",
  startDate: "",
  notes: "",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchClients = () => {
    const params = filterStatus !== "all" ? `?status=${filterStatus}` : "";
    fetch(`/api/manage/clients${params}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setClients(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClients();
  }, [filterStatus]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/manage/clients/${editingId}` : "/api/manage/clients";
    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    resetForm();
    setLoading(true);
    fetchClients();
  };

  const handleEdit = (client: Client) => {
    setForm({
      shopName: client.shopName,
      ownerName: client.ownerName,
      email: client.email,
      phone: client.phone,
      domain: client.domain,
      plan: client.plan,
      status: client.status,
      monthlyRate: String(client.monthlyRate),
      startDate: client.startDate ? client.startDate.split("T")[0] : "",
      notes: client.notes,
    });
    setEditingId(client.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this client?")) return;
    await fetch(`/api/manage/clients/${id}`, { method: "DELETE" });
    setClients(clients.filter((c) => c.id !== id));
  };

  const activeClients = clients.filter((c) => c.status === "active");
  const totalMRR = activeClients.reduce((sum, c) => sum + c.monthlyRate, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clients ({clients.length})</h1>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
        >
          {showForm ? <FaTimes /> : <FaPlus />}
          {showForm ? "Cancel" : "Add Client"}
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{activeClients.length}</p>
          <p className="text-sm text-gray-500">Active Clients</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-teal-600">${totalMRR.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Monthly Revenue</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">
            ${activeClients.length > 0 ? Math.round(totalMRR / activeClients.length).toLocaleString() : 0}
          </p>
          <p className="text-sm text-gray-500">Avg Monthly Rate</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex gap-3">
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

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">{editingId ? "Edit Client" : "Add New Client"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              required
              value={form.shopName}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              placeholder="Shop Name *"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <input
              value={form.ownerName}
              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
              placeholder="Owner Name"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <input
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
              placeholder="Domain (e.g. coinshop.com)"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <select
              value={form.plan}
              onChange={(e) => setForm({ ...form, plan: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              {planOptions.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              value={form.monthlyRate}
              onChange={(e) => setForm({ ...form, monthlyRate: e.target.value })}
              placeholder="Monthly Rate ($)"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
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

      {/* Client List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <FaSpinner className="animate-spin text-2xl text-teal-600" />
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-400">
          No clients yet. Convert leads into paying clients.
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <div key={client.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{client.shopName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[client.status] || ""}`}>
                      {client.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${planColors[client.plan] || ""}`}>
                      {client.plan}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                    {client.ownerName && <span>{client.ownerName}</span>}
                    {client.phone && (
                      <a href={`tel:${client.phone}`} className="flex items-center gap-1 text-teal-600 hover:text-teal-700">
                        <FaPhone className="text-xs" /> {client.phone}
                      </a>
                    )}
                    {client.email && (
                      <a href={`mailto:${client.email}`} className="flex items-center gap-1 text-teal-600 hover:text-teal-700">
                        <FaEnvelope className="text-xs" /> {client.email}
                      </a>
                    )}
                    {client.domain && (
                      <a href={`https://${client.domain}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-teal-600 hover:text-teal-700">
                        <FaExternalLinkAlt className="text-xs" /> {client.domain}
                      </a>
                    )}
                  </div>
                  {client.notes && (
                    <p className="text-sm text-gray-400 mt-1 italic">{client.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-800">
                    ${client.monthlyRate}/mo
                  </span>
                  <button onClick={() => handleEdit(client)} className="p-2 text-gray-400 hover:text-teal-600">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(client.id)} className="p-2 text-gray-400 hover:text-red-500">
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
