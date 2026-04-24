"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    line1: "",
    line2: "",
    city: "",
    postalCode: "",
    country: "Tunisia",
    primaryAddress: true,
  });
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadAddresses = useCallback(async () => {
    const res = await apiFetch("/api/addresses/me");
    if (res.ok) {
      setAddresses(await res.json());
    }
  }, []);

  const fetchUser = useCallback(async () => {
    const [userRes] = await Promise.all([apiFetch("/api/users/me"), loadAddresses()]);

    const data = await userRes.json();
    setUser(data);
    setLoading(false);
  }, [loadAddresses]);

  const updateUser = async () => {
    await apiFetch("/api/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    setEdit(false);
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    const res = await apiFetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressForm),
    });
    if (res.ok) {
      setAddressForm((prev) => ({ ...prev, line1: "", line2: "", city: "", postalCode: "" }));
      setMessage("Address saved");
      await loadAddresses();
    } else {
      setMessage("Could not save address");
    }
  };

  const deleteAddress = async (id) => {
    const res = await apiFetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessage("Address removed");
      await loadAddresses();
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUser();
  }, [fetchUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white/40 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20">

      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        My Profile
      </h1>

      <div className="flex flex-col gap-4">

        <input
          value={user.firstName || ""}
          disabled={!edit}
          onChange={(e) => setUser({ ...user, firstName: e.target.value })}
          className="p-3 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="First name"
        />

        <input
          value={user.lastName || ""}
          disabled={!edit}
          onChange={(e) => setUser({ ...user, lastName: e.target.value })}
          className="p-3 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Last name"
        />

        <input
          value={user.email || ""}
          disabled
          className="p-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500"
        />

        {edit ? (
          <button
            onClick={updateUser}
            className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition"
          >
            Save Changes
          </button>
        ) : (
          <button
            onClick={() => setEdit(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition"
          >
            Edit Profile
          </button>
        )}

        {message && (
          <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Saved addresses</h2>
          {addresses.length === 0 ? (
            <p className="text-sm text-gray-500">No saved addresses yet.</p>
          ) : (
            <div className="space-y-2">
              {addresses.map((address) => (
                <div key={address.id} className="rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {address.label}{address.primaryAddress ? " (Primary)" : ""}
                      </p>
                      <p>{address.line1}</p>
                      {address.line2 ? <p>{address.line2}</p> : null}
                      <p>
                        {address.city} {address.postalCode}
                      </p>
                      <p>{address.country}</p>
                    </div>
                    <button
                      onClick={() => deleteAddress(address.id)}
                      className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={saveAddress} className="grid gap-2 md:grid-cols-2">
            <input
              value={addressForm.label}
              onChange={(e) => setAddressForm((prev) => ({ ...prev, label: e.target.value }))}
              placeholder="Label"
              className="p-3 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              value={addressForm.line1}
              onChange={(e) => setAddressForm((prev) => ({ ...prev, line1: e.target.value }))}
              placeholder="Address line 1"
              className="p-3 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 md:col-span-2"
            />
            <input
              value={addressForm.line2}
              onChange={(e) => setAddressForm((prev) => ({ ...prev, line2: e.target.value }))}
              placeholder="Address line 2"
              className="p-3 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 md:col-span-2"
            />
            <input
              value={addressForm.city}
              onChange={(e) => setAddressForm((prev) => ({ ...prev, city: e.target.value }))}
              placeholder="City"
              className="p-3 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              value={addressForm.postalCode}
              onChange={(e) => setAddressForm((prev) => ({ ...prev, postalCode: e.target.value }))}
              placeholder="Postal code"
              className="p-3 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              value={addressForm.country}
              onChange={(e) => setAddressForm((prev) => ({ ...prev, country: e.target.value }))}
              placeholder="Country"
              className="p-3 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 md:col-span-2"
            />
            <label className="flex items-center gap-2 text-sm text-gray-600 md:col-span-2">
              <input
                type="checkbox"
                checked={addressForm.primaryAddress}
                onChange={(e) => setAddressForm((prev) => ({ ...prev, primaryAddress: e.target.checked }))}
              />
              <span>Set as primary address</span>
            </label>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition md:col-span-2"
            >
              Save Address
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}