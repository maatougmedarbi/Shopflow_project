"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "../components/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");
  const [buyingId, setBuyingId] = useState(null);
  const [toast, setToast] = useState(null);

  const router = useRouter();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 🔥 AUTH CHECK (BEFORE RENDER)
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      setChecked(true);
    }
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:8081/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setProducts(data);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async (productId) => {
    setBuyingId(productId);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://127.0.0.1:8081/api/orders?productId=${productId}&quantity=1`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        showToast("Order placed successfully");
        fetchProducts();
      } else {
        showToast("Order failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setBuyingId(null);
    }
  };

  useEffect(() => {
    if (checked) {
      fetchProducts();
    }
  }, [checked]);

  // 🚫 BLOCK RENDER UNTIL AUTH CHECK DONE
  if (!checked) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {toast && (
        <div className="fixed top-20 right-4 bg-white/40 backdrop-blur-md border border-white/20 px-5 py-3 rounded-xl shadow text-sm">
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">
            {loading ? "Loading..." : `${products.length} products`}
          </p>
        </div>

        <button
          onClick={fetchProducts}
          className="text-sm text-gray-600 hover:text-blue-500"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="text-red-500 mb-6">{error}</div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onBuy={handleOrder}
              buying={buyingId === product.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}