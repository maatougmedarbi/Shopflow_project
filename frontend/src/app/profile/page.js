"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://127.0.0.1:8081/api/users/me", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const data = await res.json();
    setUser(data);
    setLoading(false);
  };

  const updateUser = async () => {
    const token = localStorage.getItem("token");

    await fetch("http://127.0.0.1:8081/api/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(user),
    });

    setEdit(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

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

        {!edit ? (
          <button
            onClick={() => setEdit(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition"
          >
            Edit Profile
          </button>
        ) : (
          <button
            onClick={updateUser}
            className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition"
          >
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
}