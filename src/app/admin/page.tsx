"use client";

import { useEffect, useState } from "react";
import {
  FaCoins,
  FaChartLine,
  FaEnvelope,
  FaStar,
  FaToggleOn,
  FaDollarSign,
  FaCashRegister,
  FaCamera,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaEdit,
  FaPhoneAlt,
} from "react-icons/fa";
import { HiUsers } from "react-icons/hi";
import { formatPrice } from "@/lib/spot-prices";
import SalesChart from "@/components/admin/SalesChart";
import RecentSales from "@/components/admin/RecentSales";
import QuickAddModal from "@/components/admin/QuickAddModal";
import RecordSaleModal from "@/components/admin/RecordSaleModal";

interface LowStockItem {
  id: string;
  title: string;
  quantity: number;
}

interface TodayAppointment {
  id: string;
  name: string;
  timeSlot: string;
  type: string;
  phone: string;
  status: string;
}

interface Stats {
  totalListings: number;
  activeListings: number;
  soldItems: number;
  inventoryValue: number;
  newInquiries: number;
  subscribers: number;
  todayAppointments: number;
  pendingAppointments: number;
  todayAppointmentsList: TodayAppointment[];
  lowStockItems: LowStockItem[];
}

interface AnalyticsData {
  salesByDay: { date: string; count: number; revenue: number }[];
  totalRevenue: number;
  totalSales: number;
  averageSalePrice: number;
  topCategories: { category: string; revenue: number }[];
  recentSales: {
    id: string;
    coinListingId: string;
    salePrice: number;
    soldAt: string;
    coinListing: { title: string; category: string; images: string };
  }[];
}

type Period = 7 | 30 | 90;

const statCards = [
  {
    key: "totalListings" as const,
    label: "Total Listings",
    icon: FaCoins,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "activeListings" as const,
    label: "Active Listings",
    icon: FaToggleOn,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    key: "soldItems" as const,
    label: "Sold Items",
    icon: FaStar,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    key: "inventoryValue" as const,
    label: "Inventory Value",
    icon: FaChartLine,
    color: "text-[#C9A84C]",
    bg: "bg-yellow-50",
    isPrice: true,
  },
  {
    key: "newInquiries" as const,
    label: "New Inquiries",
    icon: FaEnvelope,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    key: "subscribers" as const,
    label: "Subscribers",
    icon: HiUsers,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [period, setPeriod] = useState<Period>(30);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [recordSaleOpen, setRecordSaleOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setAnalyticsLoading(true);
    fetch(`/api/admin/analytics?period=${period}`)
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch(() => {})
      .finally(() => setAnalyticsLoading(false));
  }, [period]);

  const maxCategoryRevenue =
    analytics?.topCategories?.[0]?.revenue || 1;

  return (
    <div>
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome to your Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRecordSaleOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            <FaCashRegister className="text-xs" /> Record Sale
          </button>
          <button
            onClick={() => setQuickAddOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C9A84C] hover:bg-[#b8963e] text-white rounded-lg transition-all font-medium shadow-sm hover:shadow-md text-sm"
          >
            <FaCamera className="text-xs" /> Quick Add
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4"
            >
              <div
                className={`w-12 h-12 rounded-lg ${card.bg} flex items-center justify-center`}
              >
                <Icon className={`text-xl ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                {loading ? (
                  <div className="h-7 w-20 bg-gray-200 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {card.isPrice
                      ? formatPrice(stats?.[card.key] ?? 0)
                      : (stats?.[card.key] ?? 0).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Revenue card */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
            <FaDollarSign className="text-xl text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">
              Revenue ({period}d)
            </p>
            {analyticsLoading ? (
              <div className="h-7 w-20 bg-gray-200 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(analytics?.totalRevenue ?? 0)}
              </p>
            )}
          </div>
        </div>

        {/* Avg Sale Price card */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
            <FaCashRegister className="text-xl text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg Sale Price</p>
            {analyticsLoading ? (
              <div className="h-7 w-20 bg-gray-200 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(analytics?.averageSalePrice ?? 0)}
              </p>
            )}
          </div>
        </div>

        {/* Today's Appointments card */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
            <FaCalendarAlt className="text-xl text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Today&apos;s Appts</p>
            {loading ? (
              <div className="h-7 w-20 bg-gray-200 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                {stats?.todayAppointments ?? 0}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {!loading && stats?.lowStockItems && stats.lowStockItems.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FaExclamationTriangle className="text-amber-500" />
            Low Stock Alerts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.lowStockItems.map((item) => (
              <div
                key={item.id}
                className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                    {item.title}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    {item.quantity === 0
                      ? "Out of stock"
                      : `Only ${item.quantity} left`}
                  </p>
                </div>
                <a
                  href={`/admin/inventory/${item.id}`}
                  className="flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors"
                >
                  <FaEdit /> Edit
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Appointments */}
      {!loading && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-amber-500" />
            Today&apos;s Appointments
            {stats?.pendingAppointments ? (
              <span className="text-xs font-normal bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {stats.pendingAppointments} pending
              </span>
            ) : null}
          </h2>
          {stats?.todayAppointmentsList && stats.todayAppointmentsList.length > 0 ? (
            <div className="space-y-3">
              {stats.todayAppointmentsList.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between border border-gray-100 rounded-lg p-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-semibold text-[#C9A84C] w-16">
                      {appt.timeSlot}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {appt.name}
                      </p>
                      <p className="text-xs text-gray-500">{appt.type}</p>
                    </div>
                  </div>
                  <a
                    href={`tel:${appt.phone}`}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#C9A84C] transition-colors"
                  >
                    <FaPhoneAlt className="text-[10px]" />
                    {appt.phone}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              No appointments today
            </p>
          )}
        </div>
      )}

      {/* Period Selector */}
      <div className="flex items-center gap-2 mb-4">
        {([7, 30, 90] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              period === p
                ? "bg-[#C9A84C] text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {p}d
          </button>
        ))}
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Sales Revenue
        </h2>
        {analyticsLoading ? (
          <div className="h-[240px] flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <SalesChart
            data={
              analytics?.salesByDay.map((d) => ({
                date: d.date,
                revenue: d.revenue,
              })) || []
            }
          />
        )}
      </div>

      {/* Bottom section: Top Categories + Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Categories */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Categories
          </h2>
          {analyticsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : analytics?.topCategories && analytics.topCategories.length > 0 ? (
            <div className="space-y-3">
              {analytics.topCategories.map((cat, i) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {i + 1}. {cat.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatPrice(cat.revenue)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C9A84C] rounded-full transition-all duration-500"
                      style={{
                        width: `${(cat.revenue / maxCategoryRevenue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">
              No category data yet
            </p>
          )}
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-xl shadow-sm p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Sales
          </h2>
          {analyticsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <RecentSales sales={analytics?.recentSales || []} />
          )}
        </div>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onCreated={() => {
          // Refresh stats
          fetch("/api/admin/stats")
            .then((res) => res.json())
            .then((data) => setStats(data))
            .catch(() => {});
        }}
      />

      {/* Record Sale Modal */}
      <RecordSaleModal
        isOpen={recordSaleOpen}
        onClose={() => setRecordSaleOpen(false)}
        onSaleRecorded={() => {
          // Refresh analytics and stats
          fetch("/api/admin/stats")
            .then((res) => res.json())
            .then((data) => setStats(data))
            .catch(() => {});
          fetch(`/api/admin/analytics?period=${period}`)
            .then((res) => res.json())
            .then((data) => setAnalytics(data))
            .catch(() => {});
        }}
      />
    </div>
  );
}
