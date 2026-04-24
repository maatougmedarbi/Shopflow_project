"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await apiFetch("/api/users");
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (id) => {
    try {
      const res = await apiFetch(`/api/users/${id}/toggle`, { method: "PUT" });
      if (res.ok) {
        toast.success("User status updated");
        fetchUsers();
      }
    } catch (err) {
      toast.error("Error updating user");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-gray-500 font-medium">Manage platform accounts</p>
      </div>

      <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{u.firstName} {u.lastName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : u.role === 'SELLER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${u.active ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}
                      >
                        {u.active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
