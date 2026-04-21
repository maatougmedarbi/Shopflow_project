"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "../components/Input";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName || !email || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8081/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Signup failed");
        return;
      }

      alert("Account created");
      router.push("/login");
    } catch (err) {
      console.error(err);
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl p-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 mb-4">
              <svg
                className="w-7 h-7 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
            <p className="mt-2 text-sm text-gray-500">
              Join ShopFlow and start shopping
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 text-red-600 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="firstName"
                label="First name"
                placeholder="Foulen"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={loading}
              />
              <Input
                id="lastName"
                label="Last name"
                placeholder="Ben Foulen"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Input
              id="signup-email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />

            <Input
              id="signup-password"
              label="Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            <Input
              id="confirm-password"
              label="Confirm password"
              type="password"
              placeholder="Repeat password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-2xl text-sm font-semibold text-white transition
                ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 shadow-lg"
                }`}
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}