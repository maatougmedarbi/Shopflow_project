"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
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
  }, [pathname]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:8081/api/users/me", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
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
    <header className="bg-white/30 backdrop-blur-xl border-b border-white/20 px-6 py-4 flex justify-between items-center">

      <Link href="/" className="text-lg font-bold text-gray-800">
        Shop<span className="text-blue-500">Flow</span>
      </Link>

      <div className="flex items-center gap-6">
        {navLink("/products", "Products")}
        {isLoggedIn && navLink("/orders", "Orders")}
        {isLoggedIn && canCreate && navLink("/products/create", "Create")}
      </div>

      <div className="flex items-center gap-4">

        {isLoggedIn ? (
          <div className="relative group">

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-semibold cursor-pointer shadow">
              {initials}
            </div>

            <div className="absolute right-0 mt-3 w-56 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 p-4">

              <div className="flex flex-col items-center text-center mb-3">

                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold mb-2">
                  {initials}
                </div>

                <p className="text-sm font-semibold text-gray-800">
                  {user
                    ? `${user.firstName || ""} ${user.lastName || ""}`
                    : role}
                </p>

                <p className="text-xs text-gray-400">
                  {user?.email}
                </p>

              </div>

              <div className="flex flex-col gap-2">

                <Link
                  href="/profile"
                  className="text-sm px-3 py-2 rounded-xl hover:bg-gray-100 transition"
                >
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-sm px-3 py-2 rounded-xl text-left hover:bg-gray-100 transition"
                >
                  Logout
                </button>

              </div>

            </div>

          </div>
        ) : (
          <>
            {navLink("/login", "Login")}
            <Link
              href="/signup"
              className="bg-blue-500 text-white px-4 py-2 rounded-xl"
            >
              Sign up
            </Link>
          </>
        )}

      </div>
    </header>
  );
}