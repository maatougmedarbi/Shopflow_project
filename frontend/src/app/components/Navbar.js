"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { apiFetch, clearTokens, getAccessToken, getRefreshToken } from "../../lib/api";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    try {
      const res = await apiFetch("/api/users/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch {
      // Ignore transient fetch failures in navbar.
    }
  }, []);

  useEffect(() => {
    const token = getAccessToken();

    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoggedIn(true);

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload.role || null);
      } catch {
        setRole(null);
      }

      fetchUser();
    } else {
      setIsLoggedIn(false);
      setRole(null);
      setUser(null);
    }
  }, [pathname, fetchUser]);

  const handleLogout = async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await fetch("http://127.0.0.1:8081/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // Ignore logout API failures and clear local tokens anyway.
      }
    }
    clearTokens();
    router.push("/login");
  };

  const navLink = (href, label) => (
    <Link
      href={href}
      className={`text-sm font-medium ${
        pathname === href
          ? "text-blue-500"
          : "text-gray-600 hover:text-blue-500"
      }`}
    >
      {label}
    </Link>
  );

  const canCreate =
    role?.includes("ADMIN") || role?.includes("SELLER");

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
    : role?.includes("ADMIN")
    ? "A"
    : "U";

  return (
    <div className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 pointer-events-none">
      <header className="max-w-7xl mx-auto bg-white/60 backdrop-blur-2xl border border-white/30 rounded-2xl md:rounded-full px-6 py-3 flex justify-between items-center shadow-[0_8px_32px_rgba(0,0,0,0.05)] pointer-events-auto transition-all duration-300">

        <Link href="/" className="text-xl font-black text-gray-900 tracking-tighter flex items-center gap-2 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs group-hover:rotate-12 transition-transform">SF</div>
          <span>Shop<span className="text-blue-600">Flow</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLink("/products", "Products")}
          {navLink("/categories", "Categories")}
          {isLoggedIn && navLink("/cart", "Cart")}
          {isLoggedIn && navLink("/orders", "Orders")}
          {isLoggedIn && role?.includes("ADMIN") && navLink("/dashboard/admin", "Admin")}
          {isLoggedIn && (role?.includes("SELLER") || role?.includes("ADMIN")) && navLink("/dashboard/seller", "Seller")}
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn && canCreate && (
            <Link
              href="/products/create"
              className="hidden sm:block text-xs font-bold uppercase tracking-wider bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-black transition-all active:scale-95"
            >
              Create
            </Link>
          )}

          {isLoggedIn ? (
            <div className="relative group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold cursor-pointer shadow-lg hover:shadow-blue-200 transition-all active:scale-90 border-2 border-white">
                {initials}
              </div>

              <div className="absolute right-0 mt-4 w-64 bg-white/90 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 invisible group-hover:visible transition-all duration-300 p-5 z-[100]">
                <div className="flex flex-col items-center text-center mb-4 pb-4 border-b border-gray-100">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black mb-3 shadow-xl rotate-3">
                    {initials}
                  </div>
                  <p className="text-sm font-bold text-gray-900 leading-tight">
                    {user ? `${user.firstName || ""} ${user.lastName || ""}` : role}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {user?.email || "Account Management"}
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <Link
                    href="/profile"
                    className="text-sm font-semibold px-4 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-semibold px-4 py-2.5 rounded-xl text-left text-red-500 hover:bg-red-50 transition-all flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 px-4 py-2">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-95"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}