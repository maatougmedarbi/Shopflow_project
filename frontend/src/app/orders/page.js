"use client";

import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://127.0.0.1:8081/api/orders", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const data = res.ok ? await res.json() : [];
    setOrders(data);
  };

  useEffect(() => {
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
            <p className="font-semibold text-gray-800">
              {o.product.name}
            </p>
            <p className="text-sm text-gray-500">
              Quantity: {o.quantity}
            </p>
            <p className="text-blue-500 font-bold">
              {o.totalPrice} DT
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}