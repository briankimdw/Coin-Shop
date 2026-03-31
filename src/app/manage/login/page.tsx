"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUserTie, FaLock, FaSpinner } from "react-icons/fa";

export default function ManageLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/manage/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();

      if (res.ok && data.authenticated) {
        router.push("/manage");
        router.refresh();
      } else {
        setError(data.error || "Invalid PIN");
        setPin("");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-600/20 mb-4">
            <FaUserTie className="text-3xl text-teal-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reseller Portal</h1>
          <p className="text-sm text-gray-400 mt-1">Enter your PIN to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1E293B] rounded-2xl p-6 shadow-xl space-y-5">
          <div>
            <label className="text-xs text-gray-400 block mb-2 uppercase tracking-wider font-medium">
              Access PIN
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN"
                required
                autoFocus
                className="w-full pl-10 pr-4 py-3 bg-[#0F172A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-lg tracking-[0.3em] text-center"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !pin}
            className="w-full py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : null}
            {loading ? "Verifying..." : "Enter Portal"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">
          Authorized access only
        </p>
      </div>
    </div>
  );
}
