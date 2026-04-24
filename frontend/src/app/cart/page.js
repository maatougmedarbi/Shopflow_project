"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
import toast from "react-hot-toast";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    line1: "",
    line2: "",
    city: "",
    postalCode: "",
    country: "Tunisia",
    primaryAddress: true,
  });
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const loadAddresses = useCallback(async () => {
    const res = await apiFetch("/api/addresses/me");
    if (res.ok) {
      const data = await res.json();
      setAddresses(data);
      const primary = data.find((address) => address.primaryAddress) || data[0];
      if (primary && !selectedAddressId) {
        setSelectedAddressId((current) => current || String(primary.id));
      }
    }
  }, [selectedAddressId]);

  const loadCart = useCallback(async () => {
    setLoading(true);
    const [cartRes] = await Promise.all([apiFetch("/api/cart"), loadAddresses()]);
    const res = cartRes;
    if (res.ok) {
      const data = await res.json();
      setCart(data);
    }
    setLoading(false);
  }, [loadAddresses]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCart();
  }, [loadCart]);

  const updateQty = async (itemId, quantity) => {
    const res = await apiFetch(`/api/cart/items/${itemId}?quantity=${quantity}`, {
      method: "PUT",
    });
    if (res.ok) {
      setCart(await res.json());
    }
  };

  const removeItem = async (itemId) => {
    const res = await apiFetch(`/api/cart/items/${itemId}`, { method: "DELETE" });
    if (res.ok) {
      setCart(await res.json());
    }
  };

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    const res = await apiFetch(`/api/cart/coupon?code=${encodeURIComponent(coupon)}`, {
      method: "POST",
    });
    if (res.ok) {
      setCart(await res.json());
      toast.success("Coupon applied");
    } else {
      toast.error("Invalid coupon");
    }
  };

  const removeCoupon = async () => {
    const res = await apiFetch("/api/cart/coupon", { method: "DELETE" });
    if (res.ok) {
      setCart(await res.json());
      toast.success("Coupon removed");
    }
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    const res = await apiFetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressForm),
    });
    if (res.ok) {
      toast.success("Address saved");
      setAddressForm((prev) => ({ ...prev, line1: "", line2: "", city: "", postalCode: "" }));
      await loadAddresses();
    } else {
      toast.error("Could not save address");
    }
  };

  const checkout = async () => {
    const res = await apiFetch(`/api/orders?addressId=${selectedAddressId || ""}`, { method: "POST" });
    if (res.ok) {
      const order = await res.json();
      toast.success("Order placed successfully");
      await loadCart();
      router.push(`/checkout/${order.id}`);
    } else {
      const text = await res.text();
      toast.error(text || "Checkout failed");
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto py-10">Loading cart...</div>;
  }

  const items = cart?.items || [];

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Cart</h1>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600">
          Your cart is empty.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-800">{item.product?.name}</p>
                <p className="text-sm text-gray-500">{Number(item.product?.price || 0).toFixed(2)} DT</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 rounded-lg border"
                  onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  className="px-3 py-1 rounded-lg border"
                  onClick={() => updateQty(item.id, item.quantity + 1)}
                >
                  +
                </button>
                <button
                  className="ml-2 px-3 py-1 rounded-lg border border-red-200 text-red-600"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex gap-2 mb-3">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Coupon code"
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <button onClick={applyCoupon} className="rounded-xl bg-blue-500 text-white px-4 py-2 text-sm">
                Apply
              </button>
              <button onClick={removeCoupon} className="rounded-xl border px-4 py-2 text-sm">
                Remove
              </button>
            </div>

            <div className="space-y-1 text-sm text-gray-700">
              <p>Subtotal: {Number(cart?.subTotal || 0).toFixed(2)} DT</p>
              <p>Shipping: {Number(cart?.shippingFee || 0).toFixed(2)} DT</p>
              <p className="font-semibold">Total TTC: {Number(cart?.totalTtc || 0).toFixed(2)} DT</p>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
              <div>
                <label htmlFor="shipping-address-select" className="mb-2 block text-sm font-semibold text-gray-700">Shipping address</label>
                <select
                  id="shipping-address-select"
                  value={selectedAddressId}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="">Select an address</option>
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.label} - {address.line1}
                    </option>
                  ))}
                </select>
              </div>

              {addresses.length === 0 && (
                <p className="text-xs text-gray-500">Add a saved address below before checkout.</p>
              )}

              <form onSubmit={saveAddress} className="grid gap-2 md:grid-cols-2">
                <input
                  value={addressForm.label}
                  onChange={(e) => setAddressForm((prev) => ({ ...prev, label: e.target.value }))}
                  placeholder="Label"
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  value={addressForm.line1}
                  onChange={(e) => setAddressForm((prev) => ({ ...prev, line1: e.target.value }))}
                  placeholder="Address line 1"
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm md:col-span-2"
                />
                <input
                  value={addressForm.line2}
                  onChange={(e) => setAddressForm((prev) => ({ ...prev, line2: e.target.value }))}
                  placeholder="Address line 2"
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm md:col-span-2"
                />
                <input
                  value={addressForm.city}
                  onChange={(e) => setAddressForm((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  value={addressForm.postalCode}
                  onChange={(e) => setAddressForm((prev) => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="Postal code"
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  value={addressForm.country}
                  onChange={(e) => setAddressForm((prev) => ({ ...prev, country: e.target.value }))}
                  placeholder="Country"
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm md:col-span-2"
                />
                <label className="flex items-center gap-2 text-sm text-gray-600 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={addressForm.primaryAddress}
                    onChange={(e) => setAddressForm((prev) => ({ ...prev, primaryAddress: e.target.checked }))}
                  />
                  <span>Set as primary address</span>
                </label>
                <button type="submit" className="rounded-xl border border-blue-200 px-4 py-2 text-sm text-blue-700 md:col-span-2">
                  Save address
                </button>
              </form>
            </div>

            <button onClick={checkout} className="mt-4 w-full rounded-xl bg-green-600 text-white py-2.5 font-semibold">
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
