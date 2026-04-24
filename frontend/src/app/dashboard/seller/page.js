"use client";

import { useEffect, useState } from "react";
import { apiFetch, getAccessToken } from "../../../lib/api";

export default function SellerDashboardPage() {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    apiFetch("/api/dashboard/seller")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setStats(data));

    apiFetch("/api/seller/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setProfile(data);
          setStoreName(data.storeName || "");
          setDescription(data.description || "");
          setLogoUrl(data.logoUrl || "");
        }
      });
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await apiFetch("/api/seller/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeName, description, logoUrl }),
    });

    if (res.ok) {
      const updated = await res.json();
      setProfile(updated);
      setMessage("Profile saved successfully");
    } else {
      setMessage("Failed to save profile");
    }
    setSaving(false);
  };

  if (!stats) {
    return <div className="max-w-5xl mx-auto py-10">Loading seller dashboard...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
      
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Revenue</p>
          <p className="text-3xl font-bold text-gray-900">{Number(stats.revenue || 0).toFixed(2)} DT</p>
        </div>
        <div className="rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">{stats.receivedOrders || 0}</p>
        </div>
        <div className="rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Pending Orders</p>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders || 0}</p>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Store Profile</h2>
        
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-5 max-w-2xl">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Store Name</label>
            <input 
              type="text" 
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Store Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Logo URL</label>
            <input 
              type="text" 
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={saving}
              className={`px-6 py-2.5 rounded-xl font-semibold text-white transition-all shadow-md ${saving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"}`}
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
