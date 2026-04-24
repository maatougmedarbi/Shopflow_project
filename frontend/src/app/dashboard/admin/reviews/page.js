"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import toast from "react-hot-toast";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      // In a real app we'd have a GET /api/reviews for admins
      // For now we'll simulate fetching all reviews or at least those pending
      const res = await apiFetch("/api/reviews/all"); // We might need to add this endpoint
      if (res.ok) {
        setReviews(await res.json());
      }
    } catch (err) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const approveReview = async (id) => {
    try {
      const res = await apiFetch(`/api/reviews/${id}/approve`, { method: "PUT" });
      if (res.ok) {
        toast.success("Review approved");
        fetchReviews();
      }
    } catch (err) {
      toast.error("Error approving review");
    }
  };

  const deleteReview = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await apiFetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Review deleted");
        fetchReviews();
      }
    } catch (err) {
      toast.error("Error deleting review");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Reviews</h1>
        <p className="mt-1 text-sm text-gray-500 font-medium">Moderate customer feedback</p>
      </div>

      <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-20 text-center text-gray-500 font-medium">No reviews to moderate.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Comment</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-white/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{r.productName || "Unknown"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{r.customerName}</td>
                    <td className="px-6 py-4">
                      <div className="flex text-yellow-400">
                        {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{r.comment}</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      {!r.approved && (
                        <button
                          onClick={() => approveReview(r.id)}
                          className="text-green-600 font-bold hover:text-green-700 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => deleteReview(r.id)}
                        className="text-red-500 font-bold hover:text-red-700 transition-colors"
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
    </div>
  );
}
