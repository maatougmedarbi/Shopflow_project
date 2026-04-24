"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const res = await apiFetch("/api/orders/my");

    const data = res.ok ? await res.json() : [];
    setOrders(data);
  };

  const cancelOrder = async (orderId) => {
    const res = await apiFetch(`/api/orders/${orderId}/cancel`, {
      method: "PUT",
    });
    if (res.ok) {
      fetchOrders();
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Orders</h1>

      <div className="grid gap-4">
        {orders.map((o) => (
          <div
            key={o.id}
            className="bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow"
          >
            {Array.isArray(o.items) && o.items.length > 0 ? (
              <div className="space-y-1">
                <p className="font-semibold text-gray-800">
                  Order #{o.orderNumber || o.id}
                </p>
                {o.items.map((item, idx) => (
                  <p key={item.productId || idx} className="text-sm text-gray-700">
                    {item.quantity} x {item.productName || "Unknown Product"}
                  </p>
                ))}
              </div>
            ) : (
              <p className="font-semibold text-gray-800">
                {o.items?.[0]?.productName || "Product"}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Quantity: {o.quantity}
            </p>
            <p className="text-sm text-gray-500">
              Status: {o.status || "PENDING"}
            </p>
            <p className="text-blue-500 font-bold">
              {o.totalPrice} DT
            </p>
            {(o.status === "PENDING" || o.status === "PAID") && (
              <button
                onClick={() => cancelOrder(o.id)}
                className="mt-3 rounded-xl border border-red-200 px-3 py-1.5 text-sm text-red-600"
              >
                Cancel order
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}