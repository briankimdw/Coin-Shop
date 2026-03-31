"use client";

import { useEffect, useState, useCallback } from "react";
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
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaQuestionCircle,
  FaSyncAlt,
  FaCog,
  FaDollarSign,
  FaGlobe,
  FaCreditCard,
  FaFileInvoiceDollar,
  FaCopy,
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
  siteUrl: string;
  adminUrl: string;
  vercelProject: string;
  lastCheckAt: string | null;
  lastCheckStatus: string;
  paymentStatus: string;
  lastPaidAt: string | null;
  contactEmail: string;
  contactPhone: string;
  stripeCustomerId: string;
  setupFee: number;
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

const paymentOptions = [
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "trial", label: "Trial" },
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

const paymentColors: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  unpaid: "bg-gray-100 text-gray-600",
  overdue: "bg-red-100 text-red-700",
  trial: "bg-blue-100 text-blue-700",
};

const siteStatusConfig: Record<string, { icon: typeof FaCheckCircle; color: string; label: string }> = {
  up: { icon: FaCheckCircle, color: "text-green-500", label: "Online" },
  down: { icon: FaTimesCircle, color: "text-red-500", label: "Down" },
  error: { icon: FaExclamationTriangle, color: "text-orange-500", label: "Error" },
  warning: { icon: FaExclamationTriangle, color: "text-yellow-500", label: "Warning" },
  unknown: { icon: FaQuestionCircle, color: "text-gray-400", label: "Unknown" },
  no_url: { icon: FaQuestionCircle, color: "text-gray-300", label: "No URL" },
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
  setupFee: "",
  startDate: "",
  notes: "",
  siteUrl: "",
  adminUrl: "",
  vercelProject: "",
  paymentStatus: "unpaid",
  contactEmail: "",
  contactPhone: "",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [checkingAll, setCheckingAll] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [billingId, setBillingId] = useState<string | null>(null);
  const [invoiceLink, setInvoiceLink] = useState<{ id: string; url: string } | null>(null);

  const fetchClients = useCallback(() => {
    const params = filterStatus !== "all" ? `?status=${filterStatus}` : "";
    fetch(`/api/manage/clients${params}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setClients(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterStatus]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

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
      siteUrl: client.siteUrl,
      adminUrl: client.adminUrl,
      vercelProject: client.vercelProject,
      paymentStatus: client.paymentStatus,
      contactEmail: client.contactEmail,
      contactPhone: client.contactPhone,
      setupFee: String(client.setupFee),
    });
    setEditingId(client.id);
    setShowForm(true);
  };

  const handleBilling = async (clientId: string, type: "setup" | "subscription") => {
    setBillingId(clientId);
    try {
      const res = await fetch("/api/manage/billing/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, type }),
      });
      const data = await res.json();
      if (data.url) {
        setInvoiceLink({ id: clientId, url: data.url });
      } else {
        alert(data.error || "Failed to create billing session");
      }
    } catch {
      alert("Network error");
    }
    setBillingId(null);
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Payment link copied to clipboard!");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this client?")) return;
    await fetch(`/api/manage/clients/${id}`, { method: "DELETE" });
    setClients(clients.filter((c) => c.id !== id));
  };

  const checkSite = async (clientId: string) => {
    setCheckingId(clientId);
    try {
      const res = await fetch("/api/manage/health-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      await res.json();
      fetchClients();
    } catch { /* ignore */ }
    setCheckingId(null);
  };

  const checkAllSites = async () => {
    setCheckingAll(true);
    try {
      await fetch("/api/manage/health-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      fetchClients();
    } catch { /* ignore */ }
    setCheckingAll(false);
  };

  const activeClients = clients.filter((c) => c.status === "active");
  const totalMRR = activeClients.reduce((sum, c) => sum + c.monthlyRate, 0);
  const sitesUp = clients.filter((c) => c.lastCheckStatus === "up").length;
  const sitesDown = clients.filter((c) => c.lastCheckStatus === "down" || c.lastCheckStatus === "error").length;
  const overdue = clients.filter((c) => c.paymentStatus === "overdue").length;

  const timeAgo = (date: string | null) => {
    if (!date) return "Never";
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Client Sites ({clients.length})</h1>
        <div className="flex gap-2">
          <button
            onClick={checkAllSites}
            disabled={checkingAll}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {checkingAll ? <FaSpinner className="animate-spin" /> : <FaSyncAlt />}
            {checkingAll ? "Checking..." : "Check All Sites"}
          </button>
          <button
            onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
          >
            {showForm ? <FaTimes /> : <FaPlus />}
            {showForm ? "Cancel" : "Add Client"}
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{activeClients.length}</p>
          <p className="text-xs text-gray-500">Active</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-teal-600">${totalMRR.toLocaleString()}</p>
          <p className="text-xs text-gray-500">MRR</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{sitesUp}</p>
          <p className="text-xs text-gray-500">Sites Up</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className={`text-2xl font-bold ${sitesDown > 0 ? "text-red-500" : "text-gray-300"}`}>{sitesDown}</p>
          <p className="text-xs text-gray-500">Sites Down</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className={`text-2xl font-bold ${overdue > 0 ? "text-red-500" : "text-gray-300"}`}>{overdue}</p>
          <p className="text-xs text-gray-500">Overdue</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">
            ${activeClients.length > 0 ? Math.round(totalMRR / activeClients.length) : 0}
          </p>
          <p className="text-xs text-gray-500">Avg Rate</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex gap-3 flex-wrap">
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

          <div className="space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Business Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <input required value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} placeholder="Shop Name *" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="Owner Name" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="Domain (coinshop.com)" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="Alt Contact Email" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="Alt Contact Phone" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Site URLs</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input value={form.siteUrl} onChange={(e) => setForm({ ...form, siteUrl: e.target.value })} placeholder="Live Site URL (https://...)" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input value={form.adminUrl} onChange={(e) => setForm({ ...form, adminUrl: e.target.value })} placeholder="Admin URL (https://.../admin)" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input value={form.vercelProject} onChange={(e) => setForm({ ...form, vercelProject: e.target.value })} placeholder="Vercel Project Name" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan & Billing</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {planOptions.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
              </select>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {statusOptions.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
              </select>
              <select value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {paymentOptions.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
              </select>
              <input type="number" step="0.01" value={form.monthlyRate} onChange={(e) => setForm({ ...form, monthlyRate: e.target.value })} placeholder="Monthly Rate ($)" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input type="number" step="0.01" value={form.setupFee} onChange={(e) => setForm({ ...form, setupFee: e.target.value })} placeholder="Setup Fee ($)" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>

          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes..." rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />

          <div className="flex gap-2">
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">
              <FaSave /> {editingId ? "Update" : "Save"}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* Client Cards */}
      {loading ? (
        <div className="flex justify-center py-10">
          <FaSpinner className="animate-spin text-2xl text-teal-600" />
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-400">
          No clients yet. Add your first client site above.
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => {
            const siteStatus = siteStatusConfig[client.lastCheckStatus] || siteStatusConfig.unknown;
            const StatusIcon = siteStatus.icon;
            const isChecking = checkingId === client.id;

            return (
              <div key={client.id} className={`bg-white rounded-xl shadow-sm overflow-hidden ${client.lastCheckStatus === "down" ? "ring-2 ring-red-200" : ""}`}>
                {/* Status bar */}
                <div className={`h-1 ${client.lastCheckStatus === "up" ? "bg-green-400" : client.lastCheckStatus === "down" ? "bg-red-400" : client.lastCheckStatus === "error" ? "bg-orange-400" : "bg-gray-200"}`} />

                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-[250px]">
                      <div className="flex items-center gap-2 mb-2">
                        {isChecking ? (
                          <FaSpinner className="animate-spin text-teal-500" />
                        ) : (
                          <StatusIcon className={siteStatus.color} />
                        )}
                        <h3 className="font-bold text-gray-900 text-lg">{client.shopName}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[client.status] || ""}`}>
                          {client.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${planColors[client.plan] || ""}`}>
                          {client.plan}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentColors[client.paymentStatus] || ""}`}>
                          <FaDollarSign className="inline text-[10px] -mt-0.5" /> {client.paymentStatus}
                        </span>
                      </div>

                      {/* Contact info */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-2">
                        {client.ownerName && <span className="font-medium text-gray-700">{client.ownerName}</span>}
                        {(client.email || client.contactEmail) && (
                          <a href={`mailto:${client.email || client.contactEmail}`} className="flex items-center gap-1 text-teal-600 hover:text-teal-700">
                            <FaEnvelope className="text-xs" /> {client.email || client.contactEmail}
                          </a>
                        )}
                        {(client.phone || client.contactPhone) && (
                          <a href={`tel:${client.phone || client.contactPhone}`} className="flex items-center gap-1 text-teal-600 hover:text-teal-700">
                            <FaPhone className="text-xs" /> {client.phone || client.contactPhone}
                          </a>
                        )}
                      </div>

                      {/* Site links */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {client.siteUrl && (
                          <a href={client.siteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors">
                            <FaGlobe /> Live Site
                          </a>
                        )}
                        {client.adminUrl && (
                          <a href={client.adminUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors">
                            <FaCog /> Admin Panel
                          </a>
                        )}
                        {client.vercelProject && (
                          <a href={`https://vercel.com/brian-kim1/${client.vercelProject}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">
                            <FaExternalLinkAlt /> Vercel
                          </a>
                        )}
                        {client.domain && !client.siteUrl && (
                          <a href={`https://${client.domain}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors">
                            <FaGlobe /> {client.domain}
                          </a>
                        )}
                      </div>

                      {client.notes && <p className="text-sm text-gray-400 italic">{client.notes}</p>}

                      <div className="flex gap-4 mt-2 text-xs text-gray-400">
                        <span>Last check: {timeAgo(client.lastCheckAt)}</span>
                        {client.startDate && <span>Started: {new Date(client.startDate).toLocaleDateString()}</span>}
                      </div>
                    </div>

                    {/* Right: Rate + Billing + Actions */}
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xl font-bold text-gray-800">
                        ${client.monthlyRate}<span className="text-sm font-normal text-gray-400">/mo</span>
                      </span>
                      {client.setupFee > 0 && (
                        <span className="text-xs text-gray-400">Setup: ${client.setupFee}</span>
                      )}

                      {/* Billing buttons */}
                      <div className="flex flex-wrap gap-1.5">
                        {client.monthlyRate > 0 && client.email && (
                          <button
                            onClick={() => handleBilling(client.id, "subscription")}
                            disabled={billingId === client.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-medium hover:bg-emerald-100 disabled:opacity-50"
                            title="Create monthly subscription link"
                          >
                            {billingId === client.id ? <FaSpinner className="animate-spin text-[10px]" /> : <FaCreditCard className="text-[10px]" />}
                            Subscribe
                          </button>
                        )}
                        {client.setupFee > 0 && client.email && (
                          <button
                            onClick={() => handleBilling(client.id, "setup")}
                            disabled={billingId === client.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium hover:bg-amber-100 disabled:opacity-50"
                            title="Create one-time setup fee link"
                          >
                            {billingId === client.id ? <FaSpinner className="animate-spin text-[10px]" /> : <FaFileInvoiceDollar className="text-[10px]" />}
                            Setup Fee
                          </button>
                        )}
                      </div>

                      {/* Show generated payment link */}
                      {invoiceLink?.id === client.id && (
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            readOnly
                            value={invoiceLink.url}
                            className="px-2 py-1 border border-gray-200 rounded text-xs w-40 truncate bg-gray-50"
                          />
                          <button
                            onClick={() => copyLink(invoiceLink.url)}
                            className="p-1 text-teal-600 hover:text-teal-700"
                            title="Copy link"
                          >
                            <FaCopy className="text-xs" />
                          </button>
                          <a
                            href={invoiceLink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-teal-600 hover:text-teal-700"
                            title="Open link"
                          >
                            <FaExternalLinkAlt className="text-xs" />
                          </a>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => checkSite(client.id)}
                          disabled={isChecking}
                          className="p-2 text-gray-400 hover:text-teal-600 disabled:opacity-50"
                          title="Check site health"
                        >
                          {isChecking ? <FaSpinner className="animate-spin" /> : <FaSyncAlt />}
                        </button>
                        <button onClick={() => handleEdit(client)} className="p-2 text-gray-400 hover:text-teal-600" title="Edit">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(client.id)} className="p-2 text-gray-400 hover:text-red-500" title="Delete">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
