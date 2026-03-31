"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaUsers,
  FaStar,
  FaPhone,
  FaThumbsUp,
  FaHandshake,
  FaDollarSign,
  FaChartLine,
  FaClock,
  FaTimesCircle,
  FaSpinner,
} from "react-icons/fa";

interface Stats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  interestedLeads: number;
  convertedLeads: number;
  notInterestedLeads: number;
  activeClients: number;
  pendingClients: number;
  inactiveClients: number;
  mrr: number;
  conversionRate: string;
  recentLeads: Array<{ id: string; name: string; status: string; webStatus: string; createdAt: string }>;
  recentClients: Array<{ id: string; shopName: string; status: string; monthlyRate: number; createdAt: string }>;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  interested: "bg-purple-100 text-purple-800",
  not_interested: "bg-gray-100 text-gray-600",
  client: "bg-teal-100 text-teal-800",
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  inactive: "bg-red-100 text-red-800",
};

export default function ManageDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/manage/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="animate-spin text-3xl text-teal-600" />
      </div>
    );
  }

  if (!stats) return <p className="text-red-500">Failed to load stats.</p>;

  const cards = [
    { label: "Total Leads", value: stats.totalLeads, icon: FaUsers, color: "bg-blue-500" },
    { label: "New Leads", value: stats.newLeads, icon: FaStar, color: "bg-green-500" },
    { label: "Contacted", value: stats.contactedLeads, icon: FaPhone, color: "bg-amber-500" },
    { label: "Interested", value: stats.interestedLeads, icon: FaThumbsUp, color: "bg-purple-500" },
    { label: "Active Clients", value: stats.activeClients, icon: FaHandshake, color: "bg-emerald-600" },
    { label: "MRR", value: `$${stats.mrr.toLocaleString()}`, icon: FaDollarSign, color: "bg-teal-600" },
    { label: "Conversion", value: `${stats.conversionRate}%`, icon: FaChartLine, color: "bg-indigo-500" },
    { label: "Pending", value: stats.pendingClients, icon: FaClock, color: "bg-orange-500" },
    { label: "Not Interested", value: stats.notInterestedLeads, icon: FaTimesCircle, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reseller Dashboard</h1>
        <div className="flex gap-3">
          <Link
            href="/manage/scraper"
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
          >
            Run Scraper
          </Link>
          <Link
            href="/manage/leads"
            className="px-4 py-2 bg-[#1E293B] text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            View Leads
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
              <div className={`${card.color} p-3 rounded-lg text-white`}>
                <Icon className="text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
            <Link href="/manage/leads" className="text-sm text-teal-600 hover:text-teal-700">
              View all
            </Link>
          </div>
          {stats.recentLeads.length === 0 ? (
            <p className="text-gray-400 text-sm">No leads yet. Run the scraper to find coin shops.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{lead.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status] || "bg-gray-100 text-gray-600"}`}>
                      {lead.status.replace("_", " ")}
                    </span>
                    {lead.webStatus === "NO WEBSITE" && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        No site
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Clients */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Active Clients</h2>
            <Link href="/manage/clients" className="text-sm text-teal-600 hover:text-teal-700">
              View all
            </Link>
          </div>
          {stats.recentClients.length === 0 ? (
            <p className="text-gray-400 text-sm">No clients yet. Convert leads into paying clients.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{client.shopName}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">
                      ${client.monthlyRate}/mo
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[client.status] || "bg-gray-100 text-gray-600"}`}>
                      {client.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
