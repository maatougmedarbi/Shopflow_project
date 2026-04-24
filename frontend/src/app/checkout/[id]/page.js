"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/api";

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState("CARD");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cardLastFour, setCardLastFour] = useState("");
  const [message, setMessage] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/orders/${id}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Order not found");
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        setMessage(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleCardChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 16) val = val.slice(0, 16);
    const formatted = val.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    setCardNumber(formatted);
    setCardLastFour(val.slice(-4));
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 3) {
      val = val.slice(0, 2) + "/" + val.slice(2);
    }
    setExpiry(val);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setPaying(true);
    setMessage("");

    try {
      const res = await apiFetch(`/api/orders/${id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          cardLastFour: method === "CARD" ? cardLastFour : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(`Payment successful! Status: ${data.status}`);
        setTimeout(() => {
          router.push("/dashboard/customer");
        }, 2000);
      } else {
        const text = await res.text();
        setMessage(`Payment failed: ${text}`);
        setPaying(false);
      }
    } catch (err) {
      setMessage("Error processing payment.");
      setPaying(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto py-10">Loading checkout...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Checkout</h1>
        <p className="text-red-500">{message}</p>
      </div>
    );
  }

  if (order.status !== "PENDING") {
    return (
      <div className="max-w-4xl mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Order already paid</h1>
        <p className="text-gray-600 mb-6">This order is in status: {order.status}</p>
        <button 
          onClick={() => router.push("/dashboard/customer")}
          className="bg-blue-500 text-white px-6 py-2 rounded-xl"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Checkout</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.includes("successful") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Summary</h2>
          <p className="text-sm text-gray-500 mb-4">Order #{order.orderNumber}</p>
          
          <div className="space-y-4 mb-6">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-gray-800">{item.productName}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">{Number(item.lineTotal).toFixed(2)} DT</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-lg font-bold text-gray-900">
              <span>Total to pay</span>
              <span>{Number(order.totalPrice).toFixed(2)} DT</span>
            </div>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Payment Details</h2>
          
          <form onSubmit={handlePay} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod("CARD")}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${method === "CARD" ? "bg-blue-50 border-blue-500 text-blue-700 shadow-inner" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  Credit Card
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("CASH")}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${method === "CASH" ? "bg-blue-50 border-blue-500 text-blue-700 shadow-inner" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  Cash on Delivery
                </button>
              </div>
            </div>

            {method === "CARD" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input 
                    type="text" 
                    placeholder="**** **** **** ****" 
                    value={cardNumber}
                    onChange={handleCardChange}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange} 
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                    <input 
                      type="text" 
                      placeholder="123" 
                      maxLength={4}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={paying}
              className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-md ${paying ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]"}`}
            >
              {paying ? "Processing..." : `Pay ${Number(order.totalPrice).toFixed(2)} DT`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
