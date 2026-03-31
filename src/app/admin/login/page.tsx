"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaCoins, FaSpinner } from "react-icons/fa";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shopName, setShopName] = useState("Admin");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => { if (d.shopName) setShopName(d.shopName); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/admin");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1B2A4A] via-[#1B2A4A] to-[#0f1a2e] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#C9A84C]/20 rounded-2xl mb-5 border border-[#C9A84C]/30">
            <FaCoins className="text-[#C9A84C] text-xl" />
          </div>
          <h1 className="text-xl font-bold text-white">
            {shopName}
          </h1>
          <p className="text-white/40 mt-1 text-sm">
            Admin Dashboard
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-7">
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 outline-none transition-all bg-gray-50/50 placeholder:text-gray-300"
                placeholder="admin@coinshop.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 outline-none transition-all bg-gray-50/50 placeholder:text-gray-300"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-[#C9A84C] hover:bg-[#b8963e] text-white font-semibold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-[#C9A84C]/25 hover:shadow-lg hover:shadow-[#C9A84C]/30 text-sm"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
