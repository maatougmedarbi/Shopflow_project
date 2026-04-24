"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, getAccessToken } from "../../../lib/api";

export default function CustomerDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    apiFetch("/api/dashboard/customer")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load dashboard data");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="max-w-5xl mx-auto py-10">Loading customer dashboard...</div>;
  }

  if (error) {
    return <div className="max-w-5xl mx-auto py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>

      {/* Stats row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Spent</p>
          <p className="text-3xl font-bold text-gray-900">{Number(data.totalSpent || 0).toFixed(2)} DT</p>
        </div>
        <div className="rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">{data.totalOrders || 0}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Orders in progress */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Orders in Progress</h2>
            <Link href="/orders" className="text-sm font-semibold text-blue-600 hover:underline">View all</Link>
          </div>
          
          {data.ordersInProgress?.length === 0 ? (
            <div className="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-dashed border-gray-300 text-center text-gray-500">
              No orders in progress.
            </div>
          ) : (
            <div className="space-y-3">
              {data.ordersInProgress?.map((order) => (
                <div key={order.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                  <div>
                    <p className="font-semibold text-gray-900">Order #{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider border border-blue-200">
                      {order.status}
                    </span>
                    <span className="font-bold whitespace-nowrap">{Number(order.totalPrice).toFixed(2)} DT</span>
                    {order.status === "PENDING" && (
                      <Link 
                        href={`/checkout/${order.id}`}
                        className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
                      >
                        Pay
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">My Recent Reviews</h2>
          
          {data.recentReviews?.length === 0 ? (
            <div className="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-dashed border-gray-300 text-center text-gray-500">
              No reviews written yet.
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentReviews?.map((review) => (
                <div key={review.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <Link href={`/products/${review.productId}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      {review.productName}
                    </Link>
                    <div className="flex text-yellow-400 text-sm">
                      {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
                  <div className="mt-2 flex justify-between items-center text-xs">
                    <span className="text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded-full font-medium ${review.approved ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}>
                      {review.approved ? "Approved" : "Pending"}
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
