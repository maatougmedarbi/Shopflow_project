"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import toast from "react-hot-toast";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "PERCENT",
    value: "",
    expiryDate: "",
    usagesMax: 100,
  });

  const fetchCoupons = async () => {
    try {
      const res = await apiFetch("/api/coupons");
      if (res.ok) {
        setCoupons(await res.json());
      }
    } catch (err) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: Number(form.value),
          expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null
        }),
      });
      if (res.ok) {
        toast.success("Coupon created");
        setShowModal(false);
        setForm({ code: "", type: "PERCENT", value: "", expiryDate: "", usagesMax: 100 });
        fetchCoupons();
      } else {
        toast.error("Failed to create coupon");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const deleteCoupon = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await apiFetch(`/api/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Coupon deleted");
        fetchCoupons();
      }
    } catch (err) {
      toast.error("Error deleting coupon");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Coupons</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">Manage promotional codes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          Create Coupon
        </button>
      </div>

      <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-20 text-center text-gray-500 font-medium">No coupons found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-white/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-600">{c.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.type}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {c.value} {c.type === "PERCENT" ? "%" : "DT"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {c.usagesCurrent} / {c.usagesMax}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteCoupon(c.id)}
                        className="text-red-500 hover:text-red-700 font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Coupon</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Code</label>
                <input
                  required
                  className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 outline-none focus:border-blue-500 transition-all"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                  <select
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 outline-none focus:border-blue-500 transition-all"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (DT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Value</label>
                  <input
                    type="number"
                    required
                    className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 outline-none focus:border-blue-500 transition-all"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 outline-none focus:border-blue-500 transition-all"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Max Usages</label>
                <input
                  type="number"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 outline-none focus:border-blue-500 transition-all"
                  value={form.usagesMax}
                  onChange={(e) => setForm({ ...form, usagesMax: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
